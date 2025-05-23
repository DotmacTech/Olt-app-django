�--
-- HUAWEI-LOOPDETECT-MIB.mib
-- MIB generated by MG-SOFT Visual MIB Builder Version 3.0 Build 271
-- Friday, September 21, 2007 at 17:12:10
--
--  HUAWEI-SAFETYSTRATEGY-MIB.mib
-- MIB generated by MG-SOFT Visual MIB Builder Version 3.0 Build 271
-- Monday, January 22, 2007 at 10:16:10
-- 
--   ====================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: Huawei Static Arp MIB Definition
-- Reference:   Huawei Enterprise MIB
-- Version:     V1.0
-- History:
-- 
-- =====================================================================
                 g"The LoopDetect MIB module is defined to indicate loop-detect function of Huawei Technologies co.,Ltd." �"L2-Adp Team Huawei Technologies co.,Ltd.
        Huawei Bld.,NO.3 Xinxi Rd., 
        Shang-Di Information Industry Base,
        Hai-Dian District Beijing P.R. China
        http://www.huawei.com
            Zip:100085
        "       "-- October 07, 2008 at 00:00 GMT
       R"Indicates the table that shows the loop detect configuration and blocking state."                       O"Indicates the entries about the loop detect configuration and blocking state."                        "Indicates the interface index."                       "Indicates the interface name."                       8"Indicates whether the loop detect function is enabled."                       X"Indicates whether the interface can enter the blocking state after a loop is detected."                       g"Indicates the interval that is used to judge whether the loop disappears and the blocking state ends."                       ("Indicates the priority in loop detect."                       f"Indicates whether the function of immediate interface Down/Up is triggered after a loop is detected."                       B"Identify the interface that is blocked after a loop is detected."                           &"The loop detect function is enabled."                 '"The loop detect function is disabled."                 "The interface is blocked."                 "The interface is unblocked."                     G"Entries about the loop detect configuration and blocking state group."                 "Loop-detect traps group."                        