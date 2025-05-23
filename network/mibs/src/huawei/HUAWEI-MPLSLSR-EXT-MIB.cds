o-- ===================================================================
-- Copyright (C) 2013 by HUAWEI TECHNOLOGIES. All rights reserved.
-- Description: This MIB provides management of MPLS basic configurations.
--              It is an extension of MPLS-LSR-STD-MIB.
-- Reference:
-- Version: V2.01
-- History:
-- V2.01 ZhangAiFen, 2013-09-24, revision
-- ===================================================================
-- ==================================================================
-- 
-- Variables and types be imported
-- 
-- ==================================================================
                                     v"This MIB provides management of MPLS basic configurations. 
                It is an extension of MPLS-LSR-STD-MIB.""Huawei Industrial Base
                  Bantian, Longgang
                   Shenzhen 518129
                   People's Republic of China 
                   Website: http://www.huawei.com
                   Email: support@huawei.com
                  " "201309241655Z" "201107301100Z" "201011221600Z" "201008111600Z" "201007121600Z" "200903101600Z" E"V2.01, added six nodes about MPLS BGP BFD configuration management." W"V2.00, delete Delval clause in these nodes: hwMplsLabelAdvertise, hwLdpVirtualStatus." ""V1.03, modified the description." ""V1.02, modified the description." L"V1.01, added the object hwMplsStaticLspTable and modified the description." D"V1.00, initial version for the configuration of MPLS capabilities."       -- Sep 24, 2013 at 16:55 GMT
          �"This object indicates the configuration of the MPLS LSR ID. 
                 Before the MPLS capability is enabled, the MPLS LSR ID must be configured. 
                 After the MPLS capability is enabled, the MPLS LSR ID cannot be modified or deleted. 
                 If the MPLS LSR ID is set as 0.0.0.0, it indicates that the MPLS LSR ID is deleted.
                 The MPLS LSR ID and the MPLS capability cannot be configured together."                       �"This object indicates the configuration or deletion of the MPLS capability. 
                 Before the MPLS capability is enabled, the MPLS LSR ID must be configured."                      �"This object indicates the way to configure label advertisement policy. 
                 By default, the label advertisement policy is implicitnull. 
                 Before the label advertisement policy is configured, MPLS capability must be enabled.
                 Options:
                 1. explicitNull(1) -indicates that the label advertisement policy is explicitNull.
                 2. implicitNull(2) -indicates that the label advertisement policy is implicitNull.
                 3. nonNull(3)      -indicates that the label advertisement policy is nonNull.
                 Default: implicitNull(2)
                "                       �"This object indicates the value of the MPLS statistics timer.
                 Range: 30-65535
                 Default: 0
                 Unit: seconds
                "                       �"This object indicates the configuration or deletion of the MPLS BFD capability. 
                 Before the MPLS BFD function is enabled, you must enable the MPLS capability and BFD capability."                       �"This object indicates the minimum forwarding period. 
                 If the minimum forwarding period is set as 0 seconds, 
                 it indicates that the minimum forwarding period returns to the default value."                       �"This object indicates the minimum receiving period. 
                 If the minimum receiving period is set as 0 seconds, 
                 it indicates that the minimum receiving period returns to the default value."                       �"This object indicates the value of the detect multiplier. 
                 If the value of the detect multiplier is set as 0, 
                 it indicates that the value returns to the default value."                      "This object indicates the name of the FEC LIST. 
                 The name of the FEC LIST is globally unique, with a valid length from 1 to 31 characters. 
                 If the character length is 0, it indicates that the FEC LIST is deleted. 
                 Furthermore, the FEC LIST cannot be modified, and you can only delete the FEC LIST and then create a new one. 
                 If the FEC LIST is used by others, you need to cancel the usage and then delete the FEC LIST.
                 Range: 1-31
                "                      M"This object indicates the MPLS BFD triggering policy. 
                 By using this object, you can also specify the next hop and the outgoing interface. 
                 To configure the MPLS BFD triggering policy, you must enable MPLS and BFD in advance. 
                 In addition, this MPLS BFD triggering policy cannot be modified, 
                 and you can only delete the policy and then create a new one.
                 Options:
                 1. triggerHost(1)    -indicates that the MPLS BFD triggering policy was configured as host.
                 2. triggerFeclist(2) -indicates that the MPLS BFD triggering policy was configured as FEC list.
                 3. disabled(3)       -indicates that the MPLS BFD triggering policy was not configured.
                 Default: triggerHost(1)
                "                       �"This object indicates the next hop when the MPLS BFD trigger policy is configured as host. 
                 The next hop and the outgoing interface can be specified at the same time."                      -"This object indicates the outgoing interface when the MPLS BFD trigger policy is configured as host. 
                 The next hop and the outgoing interface can be specified at the same time. 
                 In addition, you can get the correct interface index based on the ifIndex of ifTable."                      ^"This object indicates the FEC list when the MPLS BFD trigger policy is configured. 
                 The valid length of the FEC list ranges from 1 to 31 characters. 
                 If the specified FEC list does not exist, or the specified FEC list contains no FEC node, no LSP can be triggered.
                 Range: 1-31
                "                       3"This object indicates the LDP virtual tunnel FEC."                       �"This object indicates the configuration or deletion of the MPLS BGP BFD capability. 
                 Before the MPLS BGP BFD function is enabled, you must enable the MPLS capability and BFD capability."                       �"This object indicates the minimum forwarding period. 
                 If the minimum forwarding period is set as 0 seconds, 
                 it indicates that the minimum forwarding period returns to the default value."                       �"This object indicates the minimum receiving period. 
                 If the minimum receiving period is set as 0 seconds, 
                 it indicates that the minimum receiving period returns to the default value."                       �"This object indicates the value of the detect multiplier. 
                 If the value of the detect multiplier is set as 0, 
                 it indicates that the value returns to the default value."                      U"This object indicates the MPLS BGP BFD triggering policy. 
                 To configure the MPLS BGP BFD triggering policy, you must enable MPLS and BFD in advance. 
                 Options:
                 1. triggerHost(1)    -indicates that the MPLS BGP BFD triggering policy was configured as host.
                 2. triggerIpPrefix(2) -indicates that the MPLS BGP BFD triggering policy was configured as Ip Prefix.
                 3. disabled(3)       -indicates that the MPLS BGP BFD triggering policy was not configured.
                 Default: disabled(3)
                "                       �"This object indicates the IP Prefix name when the MPLS BGP BFD trigger policy is configured. 
                 The valid length of the IP prefix name ranges from 1 to 169 characters. 
                 Range: 1-169
                "                       �"This table is used to configure or delete MPLS FEC Node.
                 The indexes of this table are hwMplsFecNodeIpAddress, hwMplsFecNodeInterface, and hwMplsFecNodeNextHop.
                "                       �"An FEC node entry of FEC list table. It can be created, or deleted.
                 The indexes of this entry are hwMplsFecNodeIpAddress, hwMplsFecNodeInterface, and hwMplsFecNodeNextHop.
                "                       A"This object indicates the IP address of the specified FEC node."                       �"This object indicates the outgoing interface of the FEC node. 
                 You can get the correct interface index based on the ifIndex of ifTable."                       5"This object indicates the next hop of the FEC node."                      1"This object indicates whether one entry of FEC list table is created or destroyed. 
                 The value of the object can be CreatAndGo or Destroy. 
                 If the value is set as CreatAndGo, and the entry is created in hwFecListTable, the status of the object will change into active."                       �"This table is used to configure or delete the MPLS capability on the interface.
                 The index of this table is hwMplsInterfaceIndex.
                "                       �"An entry of the MPLS interface table, used to display and configure features on the MPLS-supporting interface.
                 The index of this entry is hwMplsInterfaceIndex.
                "                       �"This object indicates the interface index. 
                 You can get the correct interface index based on the ifIndex of ifTable."                       �"This object indicates the MPLS MTU of an interface. 
                 If the value of the MPLS MTU is set as 0, it indicates that the MPLS MTU is deleted."                      &"This object indicates whether one entry is created or deleted in hwMplsInterfaceTable. 
                 The value of the object can be CreatAndGo and Destroy. 
                 When the value is set as CreatAndGo, and the entry is created, the status of the object will change into active."                       �"This table is used to configure or delete static LDP FRR entries on the interface.
                 The indexes of this table are hwMplsInterfaceIndex and hwLdpStaticFrrPriority.
                "                       �"This entry is used to display and configure the FRR-supporting interface.
                 The indexes of this entry are hwMplsInterfaceIndex and hwLdpStaticFrrPriority.
                "                       ;"This object indicates the priority of a static FRR entry."                       7"This object indicates the next hop of the static FRR."                       �"This object indicates the IP prefix policy. 
                 The valid prefix length ranges from 1 to 169 characters. 
                 When the length is 0, it indicates that the policy is deleted.
                 Range: 1-169
                "                      -"This object indicates whether one entry is created or deleted in hwLdpStaticFrrInterfaceTable. 
                 The value of the object can be CreatAndGo or Destroy. 
                 When the value is set as CreatAndGo, and the entry is created, the status of the object will change into active."                       �"This table specifies LDP virtual tunnel information.
                 The index of this table is hwLdpVirtualTunnelIndex.
                "                       �"An entry of the virtual tunnel table, used to display the features associated with the virtual tunnel.
                 The index of this entry is hwLdpVirtualTunnelIndex.
                "                       5"This object indicates the LDP virtual tunnel index."                      �"The status of this LDP virtual tunnel. 
                 Options:
                 1. up(1)      -indicates that the status of this LDP virtual tunnel is Up.
                 2. down(2)    -indicates that the status of this LDP virtual tunnel is Down.
                 3. testing(3) -indicates that the status of this LDP virtual tunnel is testing, this is, in some test mode.
                 Default: up(1)
                "                       N"This object indicates the xc index of the members of the LDP virtual tunnel."                       V"This object indicates the outsegment index of the members of the LDP virtual tunnel."                           4"A trap is sent when an LDP virtual tunnel goes Up."                 6"A trap is sent when an LDP virtual tunnel goes Down."                 �"This table is used to create or delete static LSP configurations.
                 The index of this table is hwMplsStaticLspName.
                "                       �"The entry is used to show or configure static LSP.
                 The index of this entry is hwMplsStaticLspName.
                "                       /"This object indicates the name of static LSP."                      �"This object is used to identify the type of static LSP.
                 Options:
                 1. ingress(1)             -indicates that the type of the static LSP is ingress.
                 2. transit(2)             -indicates that the type of the static LSP is transit.
                 3. egress(3)              -indicates that the type of the static LSP is egress.
                 4. ingressBindTunnel(4)   -indicates that the type of the static LSP is ingress-bind-tunnel.
                "                       5"This object indicates the incoming-interface index."                       %"This object indicates the in-label."                       9"This object indicates the LSR ID of ingress static LSP."                       <"This object indicates the Tunnel ID of ingress static LSP."                       2"This object indicates the nexthop of static LSP."                       5"This object indicates the outgoing-interface index."                       &"This object indicates the out-label."                       ("This object indicates the destination."                       ("This object indicates the mask length."                      '"This object indicates whether one entry is created or deleted in hwMplsStaticLspTable. 
                 The value of the object can be CreateAndGo or Destroy. 
                 When the value is set as CreateAndGo, and the entry is created, the status of the object will change into active."                               "hwMplsModuleCompliance"                   ;"Objects required for MPLS basic configuration management."                 9"Objects required for MPLS BFD configuration management."                 ?"Objects required for LDP static FRR configuration management."                 B"Objects required for MPLS configuration management on interface."                 5"Objects required for LDP virtual tunnel management."                 4"Notification information about LDP virtual tunnel."                     ;"Objects required for static LSP configuration management."                 ="Objects required for MPLS BGP BFD configuration management."                            