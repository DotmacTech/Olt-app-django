�--  =================================================================
-- Copyright (C) 2017 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: HUAWEI LDT MIB, this mib will maintain infomation of LDT 
--              for datacomm product.  
-- Reference:
-- Version:     V1.02
-- History:
--  
--  V1.00 2008-07-15 initial version
-- =================================================================
     �"This file is an LDT-MIB. It provides such functions of 
           globally enabling or disabling the LDT function, enabling the global
           alarm, clearing statistics on ports and configuring work mode and so on." �"Huawei Industrial Base
          Bantian, Longgang
          Shenzhen 518129
          People's Republic of China
          Website: http://www.huawei.com
          Email: support@huawei.com
         " "201706081108Z" "201512031528Z" -"Add new node hwLdtPortLoopAutoTrapVlanList." 3"Update size list of hwPortLoopDetectRecoveryTime."       -- June 08, 2017 at 11:08 GMT
               �"Globally enable or disable the LDT configuration. If the hwLdtEnable 
                is 1, LDT is enabled. If the hwLdtEnable is 2, LDT is disabled. 
            By default, LDT is 2(disabled)."                       8"Packet send interval time. By default, the time is 5s."                       -"The lowest possible value of the vlan list."                       ."The highest possible value of the vlan list."                        "LDT port congfiguration table."                       /"Entries of the LDT port congfiguration table."                       �"A unique value, greater than zero, for each interface or interface
             sub-layer in the managed system. The value is consistent with the
             ifIndex in ifTable of IF-MIB."                       "The interface name."                       �"Interface enable or disable. If the hwLdtPortLdtEnable 
                is 1, it is enabled. If the hwLdtPortLdtEnable is 2, it is disabled. 
            By default, it is disabled."                       �"Action of Loop detection, including trap, blocking, noLearning, shutdown and quitvlan. By default the mode
             is shutdown."                       }"Port status, including normal, blocking, noLearning, shutdown, and quitvlan. By default the status
             is normal."                       1"Port recovery time.By default the time is 255s."                       "LDT port status table."                       '"Entries of the LDT port status table."                       "Port enabled vlanId."                       |"Port status, including normal, blocking, noLearning, shutdown and quitvlan. By default the status
             is normal."                       �"A table containing the port external loopback detection information for device.
            It can protect the port from external loopback."                       8"Entries of the port external loopback detection table."                       L"The port number which will be configured port external loopback detection."                       "The interface name."                       ~"When this object is set to 'enabled(1)' Port external loopback detection
            is enabled on this port else disabled."                       8"The detect period of port external loopback detection."                       D"The port external loopback detection protect action of this entry."                       P"The current status of port(normal/blocking/shutdown/trap/noLearning/quitvlan)."                       P"The ethernet type of the detecting packet to port external loopback detection."                       7"The lowest value of the vlan list for detecting loop."                       8"The highest value of the vlan list for detecting loop."                       Y"The detect period of system external loopback detection, the default value is 5 second."                       H"The period of sending detecting packet, the default value is 5 second."                           B"The lowest possible value of the vlan list for discovering loop."                       C"The highest possible value of the vlan list for discovering loop."                       B"The lowest possible value of the vlan list for discovering loop."                       C"The highest possible value of the vlan list for discovering loop."                       )"The possible vlan for discovering loop."                       E"VLANs for which only an alarm is reported after a loop is detected."                          "Notify the NMS that the LDT detected Loop.hwLdtInterfaceName node is interface name,
          hwLdtPortLoopVlanlistLow node is The lowest possible value of the vlan list,
          hwLdtPortLoopVlanlistHigh node is The highest possible value of the vlan list."                "Notify the NMS that the LDT detected resuming port.hwLdtInterfaceName node is interface index,
          hwLdtPortRecoverVlanlistLow node is The lowest possible value of the vlan list,
          hwLdtPortRecoverVlanlistHigh node is The highest possible value of the vlan list."                 �"Notify the NMS that Loopback does exist on this port,
		  hwLdtPortLoopDetectVlanList node indicates that which VLAN exits loopback,
		  hwPortLoopDetectStatus node is the status of this port."                 8"Notify the NMS that Loopback disappeared on this port."                         Y"The compliance statement for SNMP entities which implement
        the HUAWEI-LDT-MIB."                   �"The collection of objects which are used to configure the
        LDT implementation behavior.
        This group is mandatory for agents which implement the LDT."                 9"The collection of objects indicate information of port."                 {"The collection of notifications used to indicate HUAWEI-LDT-MIB
        data consistency and general status information."                 {"The collection of notifications used to indicate HUAWEI-LDT-MIB
        data consistency and general status information."                                