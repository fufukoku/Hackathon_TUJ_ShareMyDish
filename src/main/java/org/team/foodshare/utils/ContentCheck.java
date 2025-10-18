package org.team.foodshare.utils;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;

/**
 * @description TODO
 * @author: jason
 * date: 2025/10/18 10:57
 */

public class ContentCheck {
    //Check content for safe
    public static String removeDangerousContent(String content){
        return Jsoup.clean(content, Safelist.none());
    }


}
