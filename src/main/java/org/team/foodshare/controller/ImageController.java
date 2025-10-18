package org.team.foodshare.controller;

import jakarta.annotation.Resource;
import org.springframework.boot.autoconfigure.web.servlet.MultipartProperties;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.team.foodshare.model.Result;
import org.team.foodshare.utils.MessageSend;
import org.team.foodshare.utils.RedisUtils;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 11:00
 */

@RestController()
@RequestMapping("/api/v1/image")
public class ImageController {

    private static final List<String> Allow_Type_extension = Arrays.asList(
            ".jpg",
            ".jpeg",
            ".png",
            ".gif"
    );
    @Resource
    private MultipartProperties multipartProperties;

    @Resource
    private RedisUtils redisUtils;

    @PostMapping("/upload")
    public Result upload(@RequestParam("file") MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return MessageSend.returnError(201, "No file uploaded");
        }

        String ext = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
        String uploadFilePath = multipartProperties.getLocation();

        if (!Allow_Type_extension.contains(ext)) {
            return MessageSend.returnError(202, "File type not allowed");
        }

        uploadFilePath = uploadFileFunc(file, ext);
        if (!uploadFilePath.isEmpty()){
            String uuid = UUID.randomUUID().toString();
            redisUtils.setCacheObject("file_"+uuid, uploadFilePath, 5, TimeUnit.MINUTES);
            Map<String, Object> data = Map.of(
                    "token", uuid
            );
            return MessageSend.returnSuccess(data);
        }

        return MessageSend.returnError(-1, "File upload failed");


    }

    public String uploadFileFunc(MultipartFile file, String ext) throws IOException {
        String fileName = UUID.randomUUID() + ext;
        Path path = Paths.get("upload/"+fileName);
        file.transferTo(path);
        return fileName;
    }
}



