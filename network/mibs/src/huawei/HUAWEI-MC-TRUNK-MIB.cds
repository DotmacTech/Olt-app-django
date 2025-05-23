�--     =================================================================
-- Copyright (C) 2008 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description:  The HUAWEI-MC-TRUNK-MIB.mib provides information about MC-TRUNK
-- Reference:
-- Version:     V1.0
-- History:
--              zhenghebin,2008.11.25,publish 
-- =================================================================
                                                     "Description." "Contact-info."       -- June 10, 2005 at 19:36 GMT
           "The MC-Trunk table."                       "MC-Trunk entry."                       "The index of the MC-Trunk."                       :"The system ID of the MC-Trunk. It is a physical address."                       9"The priority of the MC-Trunk. The default value is 100."                       y"The status of the MC-Trunk. 
                 1:initialize. 
                 2:backup. 
                 3:master. "                      K"The reason for the MC-Trunk being in the current status. 
                 pri(1):Priority calculation.  
                 timeout(2):The receiving timer timed out. 
                 bfdDown(3):BFD detected the control link between the PE and peer down. 
                 peerTimeout(4):The receiving timer of the peer timed out. 
                 peerBfdDown(5):BFD of the peer detected the control link between the PE and peer down. 
                 allMemberDown(6):All members of the MC-Trunk were down. 
                 init(7):Initiated the MC-Trunk.  
                "                       &"The peer IP address of the MC-Trunk."                       ("The source IP address of the MC-Trunk."                       `"The detection time multiplier for failure detection. It is the multiple of the sending period."                       E"The period for sending packets of the MC-Trunk. The unit is 100ms. "                       !"The number of received packets."                       "The number of sent packets."                       B"The number of the dropped packets when the packets are received."                       >"The number of the dropped packets when the packets are sent."                       ?"The system ID of the peer MC-Trunk. It is a physical address."                       $"The priority of the peer MC-Trunk."                       P"The failure time for the peer MC-Trunk to receive packets. The unit is 100ms. "                       }"The type of the security key. 
                 1:The simple encrypt type.  
                 2:The cipher encrypt type. "                       "This is the security key. It can be set to a string of 1 to 16 bytes.  
                 If hwMcTrunkSecurityKeyType is simple, you can get the key.
                 If hwMcTrunkSecurityKeyType is cipher, the system returns a random string of 24 bytes."                       �"The ID of a BFD session which is bound to the MC-Trunk. When the status of the BFD session is changed, BFD will notify the MC-Trunk."                       a"Reset hwMcTrunkPacketReceive,hwMcTrunkPacketSend,hwMcTrunkPacketRecDrop,hwMcTrunkPacketSndDrop."                       D"The delay time to revert. The unit is second. The default is 120. "                       i"Current operation status of the row. It is used to manage the creation and deletion of conceptual rows."                       #"The member table of the MC-Trunk."                       "Member Entry."                       5"The ID of the MC-Trunk to which the member belongs."                       P"The type of the member. Now it is Eth-Trunk only.
                 1:EthTrunk"                       "The ID of the member."                       P"The member status.  
                 1:backup. 
                 2:master. "                      �"The reason for the member being in the current status.   
                 forceBackup(1):The work mode of the member is force-backup. 
                 forceMaster(2):The work mode of the member is force-master. 
                 mctrunkInit(3):The work mode of the member is auto. The status of MC-Trunk is initialize. 
                 mctrunkBackup(4):The work mode of the member is auto. The status of MC-Trunk is backup. 
                 mctrunkMaster(5):The work mode of the member is auto. The status of MC-Trunk is master. 
                 peerMemberDown(6):The status of the member belonging to the peer MC-Trunk is down.  
                 peerMemberUp(7):The status of the member belonging to the peer MC-Trunk is up. "                       ~"The work mode of the member. 
                 1:auto. 
                 2:forceBackup. 
                 3:forceMaster. "                       Y"The physical status of the member. 
                 1:up. 
                 2:down. "                       i"Current operation status of the row. It is used to manage the creation and deletion of conceptual rows."                           s"The trap is generated when the status of the MC-Trunk is changed or the status reason of the MC-Trunk is changed."                 q"The trap is generated when the status of the memeber is changed or the status reason of the memeber is changed."                         "Description."                   "Description."                 "Description."                 "Description."                    