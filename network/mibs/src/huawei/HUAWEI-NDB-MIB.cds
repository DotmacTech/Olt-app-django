-- ===================================================================
-- Copyright (C) 2020 by HUAWEI TECHNOLOGIES. All rights reserved.
-- Description: 
-- Reference:
-- Version: V2.00
-- ===================================================================
     ""This file is used for NDB alarm." �"Huawei Industrial Base
  Bantian, Longgang
   Shenzhen 518129
   People's Republic of China
   Website: http://www.huawei.com
   Email: support@huawei.com
 " "202009161045Z" "202009151045Z" A"V2.00, Change the OID to 367 and the parent node to hwDatacomm." "V1.00, initial version."                   K"This table container the objects infomation of network DB resource traps."                       ("the entry of network DB resource trap."                       "The slot string of traps."                       "The cpu id of traps"                       9"Indicates the ID of the fault cause of the NDB resource"                       /"Indicates the cause of the NDB resource alarm"                       "This alarm threshold of traps"                       ""The alarm current value of traps"                               9"The usage of NDB resources exceeds the alarm threshold."                 8"The usage of NDB resources is less than the threshold."                         "The object group."                 "The notification group."                         8"The core compliance statement for all implementations."             Q--                MANDATORY-GROUPS { hwNDBObjectGroup, hwNDBNotificationGroup }
            