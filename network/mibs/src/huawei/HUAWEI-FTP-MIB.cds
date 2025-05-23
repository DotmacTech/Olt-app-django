(-- =================================================================
-- Copyright (C) 2019 by  HUAWEI TECHNOLOGIES. All rights reserved.
--
-- Description: File Transfer Protocol(FTP) mib
-- Reference:   huawei enterprise mib
-- Version:     V1.04           
-- History:     V1.0  zhouyao, 2008-09-28, publish 
--                   V1.01  Wang Feng,2014-04-14,Add nodes for wlan npe trusted host
--                  V1.02  dingzanfei,2014-08-15,Add nodes for switch notify
-- =================================================================
                     �"V1.00
             The HUAWEI-FTP-MIB which contains objects manages the FTP server and FTP client configuration. 
            " �"Huawei Industrial Base
              Bantian, Longgang
               Shenzhen 518129
               People's Republic of China
               Website: http://www.huawei.com
               Email: support@huawei.com
             " "201910301800Z" "201605260900Z" "201408151600Z" "201404210900Z" i"Modified to modify A columnar object 'hwFtpHostPermitRowState' with a SYNTAX clause value of RowStatus." 8"Modified to Add nodes for ftp user login failed alarm."  "Modified to Add switch notify." 2"Modified to Add nodes for wlan npe trusted host."       "-- October 30, 2019 at 18:00 GMT
               L"The object specifies whether the FTP server is enable. Default value is 2."                           +"This object indicates trusted host table."                       @"This object indicates trusted the entry of trusted host table."                       F"The value of this object identifies the index of trusted host table."                       A"The value of this object identifies ip address of trusted host."                       C"The value of this object identifies mask address of trusted host."                       F"The value of this object identifies the description of trusted host."                       -"This object identifies the status of a row."                       1"The object specifies the threshold of FTP users"                       8"The object specifies the resune threshold of FTP users"                           ,"Login failed times in the statistic period"                       ."Statistic period to count login failed times"                           p"This object indicates the alarm reported when the number of FTP users exceed 
                the threshold. "                 t"This object indicates the alarm reported when the number of FTP users fell below 
                the threshold. "                 l"When users failed to login ftp server too frequently, login fail times and statistics period are reported."                 i"When users failed to login ftp server infrequently, login fail times and statistics period are cleared."                         W"The compliance statement for systems supporting 
                the HUAWEI-FTP-MIB."                   !"The FTP server attribute group."                 0"The collection of notifications in the module."                                