package org.team.foodshare.model;

import lombok.Data;

/**
 * @description TODO
 * @author: ksm
 * date: 2025/10/18 15:11
 */
@Data
public class ChatMessage {
    private String message;
    private String sender;
    private String receiver;
    private long timestamp;
    private int fid;
}
