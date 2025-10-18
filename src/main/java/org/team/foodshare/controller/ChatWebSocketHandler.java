package org.team.foodshare.controller;

import com.alibaba.fastjson2.JSON;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.team.foodshare.model.ChatMessage;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final ConcurrentHashMap<Integer, ConcurrentHashMap<String, WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<Integer, LinkedList<ChatMessage>> offlineMessages = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userName = getUserName(session);
        int fid = getFid(session);

        if (fid == -1 || userName == null) {
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        roomSessions.computeIfAbsent(fid, k -> new ConcurrentHashMap<>()).put(userName, session);

        LinkedList<ChatMessage> messages = offlineMessages.get(fid);
        if (messages != null && !messages.isEmpty()) {
            Iterator<ChatMessage> iterator = messages.iterator();
            while (iterator.hasNext()) {
                ChatMessage chatMessage = iterator.next();
                if (userName.equals(chatMessage.getReceiver())) {
                    session.sendMessage(new TextMessage(JSON.toJSONString(chatMessage)));
                    iterator.remove();  // 安全删除
                }
            }
            if (messages.isEmpty()) {
                offlineMessages.remove(fid);
            }
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String userName = getUserName(session);
        Integer fid = getFid(session);

        try {
            ChatMessage chatMessage = JSON.parseObject(message.getPayload(), ChatMessage.class);
            chatMessage.setSender(userName);
            chatMessage.setFid(fid);
            chatMessage.setTimestamp(System.currentTimeMillis());

            ConcurrentHashMap<String, WebSocketSession> sessionMap = roomSessions.get(fid);

            if (sessionMap == null || sessionMap.isEmpty()) {
                offlineMessages.computeIfAbsent(fid, k -> new LinkedList<>()).add(chatMessage);
                return;
            }

            String receiver = chatMessage.getReceiver();
            String messageJson = JSON.toJSONString(chatMessage);

            if (receiver == null || receiver.isEmpty()) {
                for (WebSocketSession s : sessionMap.values()) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(messageJson));
                    }
                }
            } else {
                WebSocketSession receiverSession = sessionMap.get(receiver);

                if (receiverSession != null && receiverSession.isOpen()) {
                    receiverSession.sendMessage(new TextMessage(messageJson));
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(messageJson));
                    }
                } else {
                    offlineMessages.computeIfAbsent(fid, k -> new LinkedList<>()).add(chatMessage);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            session.sendMessage(new TextMessage("{\"error\":\"message error\"}"));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userName = getUserName(session);
        int fid = getFid(session);

        if (fid != -1 && userName != null) {
            ConcurrentHashMap<String, WebSocketSession> sessions = roomSessions.get(fid);
            if (sessions != null) {
                sessions.remove(userName);
                if (sessions.isEmpty()) {
                    roomSessions.remove(fid);
                }
            }
        }
    }

    private int getFid(WebSocketSession session) {
        if (session == null || session.getUri() == null) {
            return -1;
        }

        String query = session.getUri().getQuery();
        if (query != null && query.contains("fid=")) {
            try {
                String fidStr = query.split("fid=")[1].split("&")[0];
                return Integer.parseInt(fidStr);
            } catch (Exception e) {
                return -1;
            }
        }
        return -1;
    }

    private String getUserName(WebSocketSession session) {
        if (session == null || session.getUri() == null) {
            return null;
        }

        String query = session.getUri().getQuery();
        if (query != null && query.contains("userName=")) {
            try {
                String userName = query.split("userName=")[1].split("&")[0];
                return java.net.URLDecoder.decode(userName, java.nio.charset.StandardCharsets.UTF_8);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}