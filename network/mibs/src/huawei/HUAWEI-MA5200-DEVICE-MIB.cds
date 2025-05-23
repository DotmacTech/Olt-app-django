5-- =================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved.
--
-- Description:HUAWEI-MA5200-DEVICE-MIB
-- Reference:
-- Version: V1.0
-- History:
--     
-- =================================================================
                                     "Huawei ma5200 device mib." 3"The MIB contains objects of module MA5200 device."                   G"                
                The slot number. 
                "                       K"                
                THe sub Slot number. 
                "                       G"                
                The port number. 
                "                       O"                
                The port Operate Status. 
                "                           D"
                The trap report of slot reset.
                "                 J"
                The trap report of slot register OK.
                "                 G"
                The trap report of slot plug out.
                "                     Q"
                This table contains harddisk information.  
                "                       N"
                The table entry of harddisk information.
                "                       N"
                The index of harddisk information table.
                "                       N"
                Total Size in Octets of harddisk memory.
                "                       O"
                Unused Size in Octets of harddisk memory.
                "                           ."
                Port up.
                "                 0"
                Port down.
                "                     M"                
                The user's IP address. 
                "                       N"                
                The user's MAC address. 
                "                       �"
                The index of user, could be vlan id, Session id or VCD according with the type of user.                
                "                       E"
                The outer vlan.                
                "                           E"
                The trap report of user attack.
                "                     R"
                Trap switches between basetrap and hwdevice.
                "                           ="
                Memory usage threshold.
                "                           9"
                Memory usage alarm.
                "                 ?"
                Memory usage alarm resum.
                "                     @"
                Default startup file name.
                "                       A" 
                Current startup file name.
                "                           C"
                Startup file load fail alarm.
                "                     D"
                Disk type: cfcard or harddisk.
                "                       O"    
                Disk self-test fail step.            
                "                           @"
                Disk selftest error alarm.
                "                     ;"
                Cf card unregistered.
                "                     9"
                Hpt372 occur error.
                "                     ;"
                Harddisk usage alarm.
                "                 B"
                Harddisk usage alarm resume.
                "                     6"
                In packet error.
                "                 7"
                Out packet error.
                "                     9"
                Cfcard usage alarm.
                "                 @"
                Cfcard usage alarm resume.
                "                     8"
                Flash usage alarm.
                "                 ?"
                Flash usage alarm resume.
                "                         T"The compliance statement for systems supporting 
                the this module."                   '"The MA5200 device slot group objects."                 5"The MA5200 device harddisk information table group."                  "The MA5200 device traps group."                     +"The objects of MA5200 device traps group."                    