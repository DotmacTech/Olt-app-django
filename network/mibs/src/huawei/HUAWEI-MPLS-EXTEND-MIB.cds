@-- ==================================================================
-- Copyright (C) 2017 by HUAWEI TECHNOLOGIES. All rights reserved.
-- Description:   This MIB is used for defining the HUAWEI private   
--                extended Multiprotocol Label Switching (MPLS) MIB 
--                object. All MIB objects are used to describe private
--                managed objects and trap definitions for MPLS.
-- Reference:
-- Version: V2.46
-- History:
-- V2.45 Siju Samuel, 2017-4-25, modify for hwMplsTunnelDelegationReturn/hwMplsTunnelDelegationReturnClear alarm
-- V2.44 jiangweisheng, 2017-3-4, modify for hwMplsLspBfdDown/hwMplsLspBfdDownClear add te keyword in the name
-- V2.43 zhangka, 2016-12-13, modify for hwMplsLspBfdDown/hwMplsLspBfdDownClear
-- V2.42 chujianping, 2016-06-13, modify for hwMplsTunnelBfdPathMismatch/hwMplsTunnelBfdPathMismatchClear bind VB
-- V2.41 liujialei, 2016-01-11, delete for type BITS
-- V2.40 zhangtan, 2016-01-06, modify for hwMplsTunnelBfdPathMismatch/hwMplsTunnelBfdPathMismatchClear
-- V2.39 zhangtan, 2015-09-08, modify for hwMplsTunnelHotstandbySwitch/hwMplsTunnelHotstandbyResume
-- V2.38 zhangtan, 2015-04-11, modify for hwMplsResourceType
-- V2.37 xuejianguo, 2015-03-31, add for hwMplsTunnelStatisticsTable
-- V2.36 zhangtan, 2015-03-19, modify for hwMplsResourceType
-- V2.35 wangbin, 2015-01-22, modify for hwMplsIngressLsrId, hwMplsEgressLsrId
-- V2.34 wangbin, 2015-01-12, modify for TE OPT
-- V2.33 zhangtan, 2014-11-21, modify for mpls te commit
-- V2.32 wangbin, 2014-11-14, modify for BiStatic Lsp LoopBack
-- V2.31 wangxinhai, 2014-11-06, modify for hwMplsResourceType
-- V2.30 hanyeting, 2014-08-12, modify for hwMplsResourceType
-- V2.29 zhangka, 2014-07-21, modify for private network bgp lsp threshold trap
-- V2.28 longyong, 2014-06-16, add for hwMplsResourceThresholdExceed, hwMplsResourceThresholdExceedClear, hwMplsResourceTotalCountExceed, hwMplsResourceTotalCountExceedClear 
-- V2.27 denghuan, 2014-02-17, modify for hwStaticLspDownReason add reason for ring invalid 
-- V2.26 wangxinhai, 2014-02-07, modify for hwStaticLspDownReason add reason for static lsp configure update
-- V2.25 wangxinhai, 2014-01-27, modify for static LSP/CR-LSP down-reason for  tunnel down
-- V2.24 wangxinhai, 2014-01-13, modify for ldp frr/rsvp lsp/total lsp/total cr lsp threshold trap
-- V2.23 zhangaifen, 2013-11-07, modify for bgp lsp threshold trap
-- V2.09 DouZongxin, 2012-09-14, modify for TE last error vb type
-- V2.08 DouZongxin, 2012-08-24, modify for TE last error opt project
-- V2.07 WangHonglei, 2012-07-05, revision
-- ==================================================================
-- ==================================================================
-- 
-- Variables and types be imported
-- 
-- ==================================================================
    "This MIB is used for defining the HUAWEI private   
                 extended Multiprotocol Label Switching (MPLS) MIB
                 object. All MIB objects are used to describe private
                 managed objects and trap definitions for MPLS.""Huawei Industrial Base
                  Bantian, Longgang
                   Shenzhen 518129
                   People's Republic of China
                   Website: http://www.huawei.com
                   Email: support@huawei.com
                 " "201708171640Z" "201704251600Z" "201703041600Z" "201612131600Z" "201606131600Z" "201601111600Z" "201601061200Z" "201508011200Z" "201504111200Z" "201503311419Z" "201503191700Z" "201501221916Z" "201501122016Z" "201411211800Z" "201411141800Z" "201411061630Z" "201408121450Z" "201407211427Z" "201406161417Z" "201402171905Z" "201402071100Z" "201401271100Z" "201401131345Z" "201311071745Z" "201309111745Z" "201304131652Z" "201301141525Z" "201207052025Z" "201206081405Z" "201206051100Z" "201205091100Z" "201205041100Z" "201111291100Z" "201111181100Z" "201110241100Z" "201107301100Z" "201011231155Z" "201007131535Z" "200606301554Z" )"V2.46, modify descroption of three item" Y"V2.45, modify for hwMplsTunnelDelegationReturn/hwMplsTunnelDelegationReturnClear alarm." q"V2.44,  change alarm name hwMplsLspBfdDown hwMplsLspBfdDownClear to hwMplsTeLspBfdDown hwMplsTeLspBfdDownClear." B"V2.43,  add a new alarm, hwMplsLspBfdDown hwMplsLspBfdDownClear." U"V2.42, modify hwMplsTunnelBfdPathMismatch hwMplsTunnelBfdPathMismatchClear bind VB." 4"V2.41, delete a type BITS. It is a basic type now." W"V2.40, add a new alarm, hwMplsTunnelBfdPathMismatch hwMplsTunnelBfdPathMismatchClear." T"V2.39, add a new alarm, hwMplsTunnelHotstandbySwitch hwMplsTunnelHotstandbyResume." ]"V2.38, modify enum hwMplsResourceType for supporting MPLS CSPF resource total exceed alarm." -"V2.37, add for hwMplsTunnelStatisticsTable." Z"V2.36, add enum hwMplsResourceType for supporting MPLS CSPF resource total exceed alarm." 5"V2.35, modify hwMplsIngressLsrId hwMplsEgressLsrId." ""V2.34, modify hwMplsTeFrrSwitch." A"V2.33, add  hwMplsTunnelCommitLost hwMplsTunnelCommitLostClear." �"V2.32, add  hwMplsLspLoopBack hwMplsLspLoopBackClear hwMplsSessionTunnelId hwMplsLocalLspId hwMplsIngressLsrId hwMplsEgressLsrId hwMplsLspName." ~"V2.31, add  enum ldpTotalLocalAdjacency to hwMplsResourceType for supporting MPLS resource total and threshold exceed alarm." |"V2.30, add  enum outSegment and autoPrimaryTunnelIf to hwMplsResourceType for supporting MPLS resource total exceed alarm." m"V2.29, add  enum privateNetBgp to hwMplsLspProtocol for supporting private network bgp lsp threshold alarm." �"V2.28, add traps: hwMplsResourceThresholdExceed, hwMplsResourceThresholdExceedClear, hwMplsResourceTotalCountExceed, hwMplsResourceTotalCountExceedClear." D"V2.27,  modify hwStaticLspDownReason for add invalid ring reason ." >"V2.26,  modify  hwStaticLspDownReason  for configure update." 9"V2.25,  modify  hwStaticLspDownReason  for tunnel dowm." �"V2.24,  add  enum ldpfrr, rsvp, totalLsp and totalCrLsp to hwMplsLspProtocol for supporting ldp frr, rsvp lsp, total lsp, total cr lsp threshold alarm." j"V2.23, add  enum bgp and bgpv6 to hwMplsLspProtocol for supporting bgp and bgp ipv6 lsp threshold alarm." :"V2.22, add table: hwMplsTrafficStatisticsStaticLspTable." 3"V2.21, modify hwMplsRingSwitch, hwMplsRingResume." �"V2.20, add the description of hwmplsDynamicLabelThresholdexceed,hwmplsDynamicLabelThresholdexceedClear,hwmplsDynamicLabeltotalcountexceed,hwmplsDynamicLabeltotalcountexceedClear." ="V2.07, modify the description of hwMplsLspTotalCountExceed." �"V2.06, add traps: hwmplslspThresholdexceed, hwmplslspthresholdexceedclear, hwmplslsptotalcountexceed, hwmplslsptotalcountexceedclear." �"V2.05, add traps: hwmplstunneldelete; modify hwmplsoamtunnellock to hwmplsoamlocallock; modify hwmplstunnellockrecovery to hwmplslocallockrecovery." V"V2.05, add traps: from hwMplsRingWestOamLoss to hwMplsRingEastOamUnexpectedMepClear." E"V2.04, add traps: hwMplsoamTunnellock, hwMplsoamTunnellockRecovery." B"V2.03, add traps: hwMplsExtTunnelDown, hwMplsExtTunnelDownClear." ?"V2.02, add traps: hwMplsTunnelBBSwitch, hwMplsTunnelBBResume." T"V2.01, add traps: hwMplsTeAutoTunnelDownClear, hwMplsTeAutoTunnelPrimaryDownClear." Z"V2.00, delete Defval clause in these nodes: hwMplsTunnelDownReason, hwMplsTunnelLspType." &"V1.02, modified the MIB description." &"V1.01, modified the MIB description." "V1.00, initial LSPM MIB."                  "A tunnel needs to be uniquely identified across  
                 an MPLS network. Indexes hwMplsTunnelIndex and       
                 hwMplsTunnelInstance uniquely identify a tunnel 
                 on the LSR originating the tunnel. 
                 hwMplsTunnelIngressLSRId uniquely identifies a 
                 tunnel across an MPLS network. The last index     
                 hwMplsTunnelEgressLSRId is useful in identifying
                 all instances of a tunnel that are terminated on
                 the same egress LSR.                                       
                 The indexes of this table are hwMplsTunnelIndex,    
                 hwMplsTunnelInstance, hwMplsTunnelIngressLSRId and  
                 hwMplsTunnelEgressLSRId."                      "A tunnel needs to be uniquely identified across  
                 an MPLS network. Indexes hwMplsTunnelIndex and       
                 hwMplsTunnelInstance uniquely identify a tunnel 
                 on the LSR originating the tunnel. 
                 hwMplsTunnelIngressLSRId uniquely identifies a 
                 tunnel across an MPLS network. The last index     
                 hwMplsTunnelEgressLSRId is useful in identifying
                 all instances of a tunnel that are terminated on
                 the same egress LSR.                                       
                 The indexes of this entry are hwMplsTunnelIndex,    
                 hwMplsTunnelInstance, hwMplsTunnelIngressLSRId and  
                 hwMplsTunnelEgressLSRId." i"1. RFC 2863 - The Interfaces Group MIB, McCloghrie,
                K., and F. Kastenholtz, June 2000 "                    �"Uniquely identifies a set of tunnel instances 
                between a pair of ingress and egress LSRs. 
                When the MPLS signalling protocol is rsvp(2), this value 
                equals to the value signaled in the Tunnel ID 
                of the SESSION object. When the MPLS signalling protocol 
                is crldp(3), this value equals to the value 
                signaled in the LSP ID. Reference to MPLS-TE-STD-MIB."                      #"Uniquely identifies a particular instance of a 
                tunnel between a pair of ingress and egress LSRs. 
                It is used to identify multiple instances of 
                tunnels for backup and parallel tunnels. 
                When the MPLS signaling protocol is 
                rsvp(2), this value equals to the LSP ID 
                of the Sender Template object. When the signaling 
                protocol is crldp(3) there is no equivalent 
                signaling object. Reference to MPLS-TE-STD-MIB."                      "Indicates the ingress LSR ID of this tunnel. 
                When the MPLS signalling protocol 
                is rsvp(2), this value equals to the Tunnel 
                Sender Address in the Sender Template object and may 
                equal to the Extended Tunnel ID in the 
                SESSION object. When the MPLS signalling protocol is 
                crldp(3), this value equals to the Ingress 
                LSR Router ID in the LSPID TLV object. 
                Reference to MPLS-TE-STD-MIB."                       ]"Indicates the egress LSR ID of this 
                tunnel. Reference to MPLS-TE-STD-MIB."                      6"Indicates the bandwidth type used by this tunnel. 
                Options:
                1. bc0(1)          -indicates the bandwidth type is bc0.
                2. bc1(2)          -indicates the bandwidth type is bc1.
                3. invalidValue(3) -indicates the invalid value.
                "                       ^"Indicates the bandwidth used by this tunnel.
                Unit: kbit/s
                "                      �"Indicates the management status of this 
                tunnel.Reference to MPLS-TE-STD-MIB.
                Options:
                1. up(1)      -indicates the management status of this tunnel is up.
                2. down(2)    -indicates the management status of this tunnel is down.
                3. testing(3) -indicates the tunnel is used in some test mode.         
                "                      u"Indicates the actual operational status of this tunnel, 
                which is but not limited to the status of this tunnel of
                a certain period.Reference to MPLS-TE-STD-MIB.
                Options:
                1. up(1)             -indicates that the operational status of this tunnel is up.          
                2. down(2)           -indicates that the operational status of this tunnel is down.
                3. testing(3)        -indicates that the tunnel is used in some test mode.
                4. unknown(4)        -indicates the invalid value.
                5. dormant(5)        -indicates that the status cannot be determined.
                6. notPresent(6)     -indicates that some component is missing
                7. lowerLayerDown(7) -indicates the Down state due to the state of lower layer interfaces.
                "                      �"Indicates protection types desired by the primary 
                tunnel, such as node protection, link protection or 
                bandwidth protection.
                Options:
                1. localProtectionDesired(0)     -indicates link protection.
                2. nodeProtectionDesired(1)      -indicates node protection.
                3. bandwidthProtectionDesired(2) -indicates bandwidth protection.              
                "                       z"Indicates the setup PRI of auto-bypass tunnel.
                Range: 0-7
                Default: 7
                "                       |"Indicates the holding PRI of auto-bypass tunnel.
                Range: 0-7
                Default: 7
                "                       �"Indicates the protecting bandwidth of auto-bypass tunnel. 
                Its value is defined by the configuration on the primary 
                tunnel.
                Unit: kbit/s"                       "Indicates FRR switching times"                       �"Indicates the index of the bypass tunnel table, that is, 
                the LSP ID of the bypass tunnel. The bypass table shows 
                interfaces protected by specified bypass tunnel."                       o"Indicates the table index of the protection type adopted 
                by each hop of the primary tunnel."                      c"Indicates the tunnel name. The name can refer to the tunnel 
                on the console port of the LSR. If mplsTunnelIsIf is set to 
                True, the IfName of the interface corresponding to this tunnel 
                should have a value equal to hwMplsTunnelName. 
                Reference to the description of IfName in RFC 2863."                       h"Indicates the interface index of the tunnel. It uniquely 
                identifies the tunnel name."                       �"Indicates the original bandwidth of the tunnel 
                when the tunnel is in the Modify state.
                Unit: kbit/s"                       �"Indicates the bandwidth of the tunnel that is to be changed 
                when the tunnel is in the Modify state.
                Unit: kbit/s"                       �"The bandwidth of Class-Type 0 (CT0) in this tunnel, in kbit/s.                
                If all CT bandwidths are 0s, it means that this tunnel's Class-Type
                is CT0, and bandwidth is 0 kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 1 (CT1) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 2 (CT2) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 3 (CT3) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 4 (CT4) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 5 (CT5) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 6 (CT6) in this tunnel, in kbit/s.
                Unit: kbit/s"                       ^"The bandwidth of Class-Type 7 (CT7) in this tunnel, in kbit/s.
                Unit: kbit/s"                      �"This object is meaningful only at the ingress of the tunnel. It indicates LSP types.                                                                 
                Options: 
                0. invalid(0) -indicates that the LSP type is invalid, the possible cause is that the LSP is not created at an ingress. 
                1. primary(1) -indicates the primary LSP
                2. primaryModifing(2) -indicates the LSP that will replace the primary LSP
                3. hotStandby(3) -indicates the hot-standby LSP
                4. hotStandbyModifing(4) -indicates the LSP that will replace the hot-standby LSP
                5. ordinary(5) -indicates the ordinary LSP
                6. ordinaryModifing(6) -indicates the LSP that will replace the ordinary LSP
                7. bestEffort(7) -indicates the Best-Effort LSP
                8. bestEffortModifing(8) -indicates the LSP that will replace the Best-Effort LSP
                Modifying LSPs are created when users modify the make-before-break attribute of the corresponding LSP types. After being created, modifying LSPs replace the corresponding LSPs to transmit traffic.              
                "                       a"Indicates the tunnel interface name. The object is 
                only valid at the ingress."                       ."Indicates the signal protocol of this tunnel"                      �"This object is meaningful only at the ingress of the tunnel. It indicates tunnel types.                                                                 
                Options: 
                1. invalid(1) -indicates that the tunnel type is invalid, the possible cause is that it is not ingress node of this tunnel
                2. primaryTunnel(2) -indicates that this is a primary tunnel
                3. bypassTunnel(3) -indicates that this is a bypass tunnel
                "                       �"Indicates the bypass tunnel. The indexes of this table are 
                hwTunnelFrrBypassListIndex and hwTunnelFrrBypassIndex."                       �"Indicates the bypass tunnel.The indexes of this entry are 
                hwTunnelFrrBypassListIndex and hwTunnelFrrBypassIndex."                       ["Indicates the index of the bypass tunnel table, that is, the LSP ID of the bypass tunnel."                       5"Indicates the index of the bypass tunnel interface."                       F"Indicates the index of the interface protected by the bypass tunnel."                       �"Indicates the FrrARHopTable, which will show every hop's frr 
                protect information of the tunnel.
                The indexes of this table are hwTunnelFrrARHopListIndex and hwTunnelFrrARHopIndex."                       �"Indicates the FrrARHopTable, which will show every hop's frr 
                protect information of the tunnel.
                The indexes of this entry are hwTunnelFrrARHopListIndex and hwTunnelFrrARHopIndex."                       A"Indicates the table index of each hop along the primary tunnel."                       ;"Indicates the index of each hop along the primary tunnel."                       �"Indicates the FRR protection types desired by the primary tunnel interface, including:
                0: link protection,
                1: node protection,
                2: bandwidth protection
                "                      "Indicates the actual FRR protection types of the primary tunnel interface, including:
                0: link protection,
                1: node protection,
                2: bandwidth protection,
                3: primary tunnel protection in use
                "                      "Indicates the primary tunnel is protected by which bypass tunnel. The indexes of this
                table are hwTunnelFrrRouteDBTunnelIndex, hwTunnelFrrRouteDBTunnelInstance, 
                hwTunnelFrrRouteDBTunnelIngressLSRId and hwTunnelFrrRouteDBTunnelEngressLSRId."                      "Indicates the primary tunnel is protected by which bypass tunnel. The indexes of this
                entry are hwTunnelFrrRouteDBTunnelIndex, hwTunnelFrrRouteDBTunnelInstance, 
                hwTunnelFrrRouteDBTunnelIngressLSRId and hwTunnelFrrRouteDBTunnelEngressLSRId."                      �"Identifies the index of the primary. Manager obtains new index 
                values for row creation in this table by reading mplsTunnelIndexNext. 
                When the MPLS signaling protocol is rsvp(2), this value equals to 
                the value signaled in the Tunnel ID of the SESSION object. When 
                the MPLS signaling protocol is crldp(3), this value equals to the 
                value signaled in the LSP ID. Reference to MPLS-TE-STD-MIB."                      5"Uniquely identifies a particular instance of a
                tunnel between a pair of ingress and egress LSRs. 
                It is the object identifies multiple instances of 
                tunnels for the purposes of backup and parallel 
                tunnels. When the MPLS signaling protocol is 
                rsvp(2), this value equals to the LSP ID
                of the Sender Template object. When the signaling
                protocol is crldp(3), there is no equivalent
                signaling object. Reference to MPLS-TE-STD-MIB."                      �"Identifies the ingress LSR ID of the primary tunnel. 
                When the MPLS signalling protocol is rsvp(2),LSR ID 
                equals to the Tunnel Sender Address in the Sender 
                Template object or the Extended Tunnel Id in the 
                SESSION object. When the MPLS signalling protocol is 
                crldp(3),  LSR ID equals to the Ingress 
                LSR Router ID in the LSPID TLV object."                       e"Identifies the egress LSR ID of the primary tunnel. 
                Reference to MPLS-TE-STD-MIB."                       5"Indicates the interface index of the bypass tunnel."                       D"Indicates the inner label of the primary tunnel and bypass tunnel."                      �"A static LSP is created by a network administrator by using 
                static MPLS. Note that only point-to-point static LSP segments
                are supported. Each static MPLS LSP can thus have one out-segment
                originating at this LSR and/or one in-segment terminating at
                this LSR. The indexes of this table are hwStaticLspIndex, 
                hwStaticLspInSegmentIndex, and hwStaticLspOutSegmentIndex."                      �"A static LSP is created by a network administrator by using 
                static MPLS. Note that only point-to-point static LSP segments
                are supported. Each static MPLS LSP can thus have one out-segment
                originating at this LSR and/or one in-segment terminating at
                this LSR. The indexes of this entry are hwStaticLspIndex, 
                hwStaticLspInSegmentIndex, and hwStaticLspOutSegmentIndex."                       u"Indicates the index of the static LSP. If the string is 0x00, 
                it means that the index is invalid."                      "Indicates the incoming label index of the static LSP/CR-LSP. 
                If the string is 0x00, it means that the index is invalid. 
                In this case, no corresponding mplsInSegmentEntry exists. 
                Reference to MPLS-LSR-STD-MIB."                      *"Indicates the outgoing index of the static LSP/CR-LSP. 
                If the entry is used to identify the incoming node or 
                intermediate node of the LSP, this object cannot be set 
                to the string 0x00. Because corresponding mplsOutSegmentEntry 
                exists. If the entry is used to identify the outgoing node 
                of the LSP, this object must be set to the string 0x00. Because  
                no corresponding mplsOutSegmentEntry exists. 
                Reference to MPLS-LSR-STD-MIB."                      S"Denotes the entity that creates and manages the static LSP. See MPLS-LSR-STD-MIB.
                Options:
                1. static(1)          -indicates the static LSP. 
                2. crstatic(2)        -indicates the static CR-LSP. 
                3. other(3)           -indicates the LSP of another type.
                "                       �"Indicates the name of the static LSP or CR-LSP. 
                The name is appointed when the static LSP or CR-LSP 
                is created." e"RFC 2863 - The Interfaces Group MIB, McCloghrie, K.,
                and F. Kastenholtz, June 2000"                    |"Indicates the actual operation status of the static LSP/CR-LSP. 
                Options: 
                1. up(1)        -indicates that the static LSP/CR-LSP is in Up state.
                2. down(2)      -indicates that the static LSP/CR-LSP is in down state.
                3. testing(3)   -indicates that the static LSP/CR-LSP is used in test mode.
                "                      )"The Class-Type of this static lsp.
                Options:                                                         
                1. ct0(1)       -indicates that the class type is ct0. 
                2. ct1(2)       -indicates that the class type is ct1.
                3. ct2(3)       -indicates that the class type is ct2.
                4. ct3(4)       -indicates that the class type is ct3.
                5. ct4(5)       -indicates that the class type is ct4.
                6. ct5(6)       -indicates that the class type is ct5.
                7. ct6(7)       -indicates that the class type is ct6.
                8. ct7(8)       -indicates that the class type is ct7.  
                9. none(9)      -indicates that the class type is unconfiged.              
                "                       A"The bandwidth of this static lsp.
                Unit: kbit/s"                      "TE-class mapping is a set of a maximum of eight TE-class items.          
                TE-class is a <Class-Type, Priority> pair, such as TE-Class[1] = <CT0, 5>.              
                A (setup/holding) priority associated with an LSP valid only if it appears
                as a pair with the Class-Type. Class-Types and priorities can be randomly
                paired up. You can define a maximum of eight <Class-Type, Priority> pairs.     
                The LSR is considered to support a particular Class-Type only if it appears 
                in the definition of the eight possible TE-Classes. It is suggested that all
                the LSRs in the domain use the same TE-Class mapping. The index of this table
                is hwMplsTeClassId."                      "TE-class mapping is a set of a maximum of eight TE-class items.          
                TE-class is a <Class-Type, Priority> pair, such as TE-Class[1] = <CT0, 5>.              
                A (setup/holding) priority associated with an LSP valid only if it appears
                as a pair with the Class-Type. Class-Types and priorities can be randomly
                paired up. You can define a maximum of eight <Class-Type, Priority> pairs.     
                The LSR is considered to support a particular Class-Type only if it appears 
                in the definition of the eight possible TE-Classes. It is suggested that all
                the LSRs in the domain use the same TE-Class mapping. The index of this entry
                is hwMplsTeClassId."                       Z"This value represents the index of the TE-Class configured
                on this LSR."                      H"This value represents a Class-Type supported on the LSR.
                Options:                                                          
                1. ct0(1)   -indicates that the class type of static CR-LSP is ct0.
                2. ct1(2)   -indicates that the class type of static CR-LSP is ct1.
                3. ct2(3)   -indicates that the class type of static CR-LSP is ct2.
                4. ct3(4)   -indicates that the class type of static CR-LSP is ct3.
                5. ct4(5)   -indicates that the class type of static CR-LSP is ct4.
                6. ct5(6)   -indicates that the class type of static CR-LSP is ct5.
                7. ct6(7)   -indicates that the class type of static CR-LSP is ct6.
                8. ct7(8)   -indicates that the class type of static CR-LSP is ct7.
                "                       �"This value represents the preemption priority (setup or holding) 
                supported for a particular class-type, on the LSR.
                Range: 0-7
                Default: 7
                "                       :"Textual description of the TE-Class defined by this row."                       �"This table describes bandwidth constraints associated with MPLS TE
                enabled interfaces. The index of this table is ifIndex."                       �"This table describes bandwidth constraints associated with MPLS TE
                enabled interfaces. The index of this entry is ifIndex."                       f"The maximum reservable bandwidth on this interface.
                Unit: kbit/s 
                "                       e"The bandwidth of Class-Type 0 (CT0) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 1 (CT1) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 2 (CT2) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 3 (CT3) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 4 (CT4) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 5 (CT5) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 6 (CT6) in this tunnel.
                Unit: kbit/s
                "                       e"The bandwidth of Class-Type 7 (CT7) in this tunnel.
                Unit: kbit/s
                "                       �"hwStaticLspTnlTable is used to display static LSP token of   
                 a static LSP of a specified name. The index of this table 
                 is hwStaticLspTnlName."                       �"hwStaticLspTnlTable is used to display static LSP token of   
                 a static LSP of a specified name. The index of this entry 
                 is hwStaticLspTnlName."                       '"Indicates the name of the Static Lsp."                       ("Indicates the token of the Static Lsp."                       �"This table is used to display VPN QoS information of a specified TE Tunnel according to TunnelID.
                 The index of this table is hwMplsTnlID."                       �"This table is used to display VPN QoS information of a specified TE Tunnel according to TunnelID.
                 The index of this entry is hwMplsTnlID."                       7"The value of this object identifies the TE tunnel ID."                       x"The value of this object identifies the bandwidth the TE tunnel can provide for VPN QoS.
                Unit: kbit/s"                       k"The value of this object identifies the bandwidth used by VPN QoS, in Kbps.
                Unit: kbit/s"                       ?"Indicates the inbound interface index of a static LSP/CR-LSP."                       D"Indicates the name of an inbound interface of a static LSP/CR-LSP."                      �"Indicates the reason for static LSP/CR-LSP Down:
                0. Other
                1. Static LSP/CR-LSP up
                2. MPLS disabled on an interface
                3. MPLS TE disabled on an interface
                4. Route change
                5. Tunnel binding associated with the static LSP/CR-LSP deleted
                6. Static LSP/CR-LSP configuration delete
                7. Inbound interface Down
                8. Outbound interface Down
                9. Tunnel associated with the static LSP/CR-LSP has been shut down
                10. Static LSP/CR-LSP configuration update
                11. The bound ring is invalid."                      �"A tunnel needs to be uniquely identified across  
                 an MPLS network. hwMplsTunnelStatisticsTunnelIndex 
                 uniquely identifies a tunnel on the LSR originating 
                 the tunnel. hwMplsTunnelStatisticsIngressLSRId 
                 uniquely identifies a tunnel across an MPLS network. 
                 The last index hwMplsTunnelStatisticsEgressLSRId is 
                 useful in identifying all instances of a tunnel that
                 are terminated on the same egress LSR. 

                 The indexes of this table are 
                 hwMplsTunnelStatisticsTunnelIndex,    
                 hwMplsTunnelStatisticsIngressLSRId and  
                 hwMplsTunnelStatisticsEgressLSRId."                      �"A tunnel needs to be uniquely identified across 
                 an MPLS network. hwMplsTunnelStatisticsTunnelIndex 
                 uniquely identifies a tunnel on the LSR originating 
                 the tunnel. hwMplsTunnelStatisticsIngressLSRId uniquely 
                 identifies a tunnel across an MPLS network. The last 
                 index hwMplsTunnelStatisticsEgressLSRId is useful in 
                 identifying all instances of a tunnel that are terminated
                 on the same egress LSR.

                 The indexes of this table are 
                 hwMplsTunnelStatisticsTunnelIndex,    
                 hwMplsTunnelStatisticsIngressLSRId and  
                 hwMplsTunnelStatisticsEgressLSRId." i"1. RFC 2863 - The Interfaces Group MIB, McCloghrie,
                K., and F. Kastenholtz, June 2000 "                    �"Uniquely identifies a set of tunnel instances 
                 between a pair of ingress and egress LSRs. 
                 When the MPLS signalling protocol is rsvp(2), this value 
                 equals to the value signaled in the Tunnel ID 
                 of the SESSION object. When the MPLS signalling protocol 
                 is crldp(3), this value equals to the value 
                 signaled in the LSP ID. Reference to MPLS-TE-STD-MIB."                      "Indicates the ingress LSR ID of this tunnel. 
                 When the MPLS signalling protocol 
                 is rsvp(2), this value equals to the Tunnel 
                 Sender Address in the Sender Template object and may 
                 equal to the Extended Tunnel ID in the 
                 SESSION object. When the MPLS signalling protocol is 
                 crldp(3), this value equals to the Ingress 
                 LSR Router ID in the LSPID TLV object. 
                 Reference to MPLS-TE-STD-MIB."                       ^"Indicates the egress LSR ID of this 
                 tunnel. Reference to MPLS-TE-STD-MIB."                       g"The total number of octets received on the interface,
                 including framing characters."                       n"The total number of octets transmitted out of the
                 interface, including framing characters."                               S"This notification indicates that the status of referred static LSP changes to Up."                 U"This notification indicates that the status of referred static LSP changes to Down."                 V"This notification indicates that the status of referred static CR-LSP changes to Up."                 X"This notification indicates that the status of referred static CR-LSP changes to Down."                 W"This notification indicates that the primary tunnel is bound to TE FRR bypass tunnel."                 R"This notification indicates that the primary tunnel is unbound to bypass tunnel."                 ^"This notification indicates that the primary tunnel is switches to the TE FRR bypass tunnel."                 e"This notification indicates that the primary tunnel is switched back from the TE FRR bypass tunnel."                 b"This notification indicates that the data is switched from the primary CR-LSP to the HSB CR-LSP."                 b"This notification indicates that the data is switched from the HSB CR-LSP to the primary CR-LSP."                 c"This notification indicates that the primary CR-LSP is down and the Ordinary backup CR-LSP is up."                 n"This notification indicates that the data is switched from the Ordinary backup CR-LSP to the primary CR-LSP."                 Q"The hwMplsTunnelUp trap indicates that the staus of the tunnel changes into Up."                 U"The hwMplsTunnelDown trap indicates that the staus of the tunnel changes into Down."                 J"This notification indicates that the bandwidth of the tunnel is changed."                 n"This object indicates that the loss ratio of the packets carried by the tunnel exceeded the first threshold."                 �"
                This object indicates that the loss ratio of the packets carried by the tunnel dropped below the first threshold.
                "                 l"
                This object indicates that TP OAM detected tunnel connectivity faults.
                "                 r"
                This object indicates that TP OAM did not detect tunnel connectivity faults.
                "                 l"
                This object indicates that TP OAM detected an alarm indication signal.
                "                 t"
                This object indicates that TP OAM no longer detected alarm indication signals.
                "                 `"
                This object indicates that TP OAM detected remote defects.
                "                 t"
                This object indicates that the remote defects detected by TP OAM were removed.
                "                 �"
                This object indicates that the names configured on the two ends of the tunnel are inconsistent.
                "                 �"
                This object indicates that the names configured on the two ends of the tunnel now are consistent.
                "                 �"
                This object indicates that the MEP-IDs configured on the two ends of the tunnel are inconsistent.
                "                 �"
                This object indicates that the MEP-IDs configured on the two ends of the tunnel now are consistent.
                "                 �"
                This object indicates that the loss ratio of the packets carried by the tunnel exceeded the second threshold in the local link.
                "                 �"
                This object indicates that the loss ratio of the packets carried by the tunnel dropped below the second threshold in the local link.
                "                 �"
                This object indicates that the TP OAM detection periods on the two ends of the tunnel are inconsistent.
                "                 �"
                This object indicates that the TP OAM detection periods on the two ends of the tunnel now are consistent.
                "                 �"
                This object indicates that TP OAM detected the service level of the tunnel has been locked.                
                "                 �"
                This object indicates that TP OAM detected the service level of the tunnel has not been locked.
                "                 t"
                This object indicates that MPLS OAM detected the tunnel received excess alarm.
                "                 x"
                This object indicates that MPLS OAM detected the tunnel received excess alarm end.
                "                 v"
                This object indicates that MPLS OAM detected the tunnel received MisMatch alarm.
                "                 z"
                This object indicates that MPLS OAM detected the tunnel received MisMatch alarm end.
                "                 v"
                This object indicates that MPLS OAM detected the tunnel received MisMerge alarm.
                "                 z"
                This object indicates that MPLS OAM detected the tunnel received MisMerge alarm end.
                "                 u"
                This object indicates that MPLS OAM detected the tunnel received Unknown alarm.
                "                 y"
                This object indicates that MPLS OAM detected the tunnel received Unknown alarm end.
                "                 q"
                This object indicates that MPLS OAM detected the tunnel received BDI alarm.
                "                 u"
                This object indicates that MPLS OAM detected the tunnel received BDI alarm end.
                "                 u"
                This object indicates that MPLS OAM detected the tunnel received OAMFAIL alarm.
                "                 y"
                This object indicates that MPLS OAM detected the tunnel received OAMFAIL alarm end.
                "                 W"This notification indicates that the status of the RSVP-TE Primary LSP changes to Up."                 Y"This notification indicates that the status of the RSVP-TE Primary LSP changes to Down."                 ["This notification indicates that the status of the RSVP-TE Hot-standby LSP changes to Up."                 ]"This notification indicates that the status of the RSVP-TE Hot-standby LSP changes to Down."                 X"This notification indicates that the status of the RSVP-TE Ordinary LSP changes to Up."                 Z"This notification indicates that the status of the RSVP-TE Ordinary LSP changes to Down."                 ["This notification indicates that the status of the RSVP-TE Best-effort LSP changes to Up."                 ]"This notification indicates that the status of the RSVP-TE Best-effort LSP changes to Down."                 M"This notification indicates that the TE Auto tunnel Down alarm was cleared."                 j"This notification indicates that the Down alarm about the primary LSP in the TE Auto tunnel was cleared."                 f"This notification indicates that the primary CR-LSP is Down and the Best-effort backup CR-LSP is Up."                 m"This notification indicates that data is switched from the Best-effort backup CR-LSP to the primary CR-LSP."                 K"This notification indicates that the status of te tunnel changes to Down."                 K"This notification indicates that the down alarm of te tunnel was cleared."                 l"
                This object indicates that TP OAM detected the tunnel has been locked.
                "                 p"
                This object indicates that TP OAM detected the tunnel has not been locked.
                "                 B"This notification indicates that the mpls te tunnel was deleted."                 f"
                This object indicates that lsp count has exceeded the threshold.
                "                 t"
                This object indicates that lsp count has resumed from exceeding the threshold.
                "                 g"
                This object indicates that lsp count has reached the total count.
                "                 u"
                This object indicates that lsp count has resumed from reaching the total count.
                "                 h"
                This object indicates that label usage has exceeded the threshold.
                "                 v"
                This object indicates that label usage has resumed from exceeding the threshold.
                "                 i"
                This object indicates that label count has reached the total count.
                "                 }"
                This object indicates that label usage count has resumed from reaching the total count.
                "                 "
                This object indicates that the number of MPLS resources has exceeded the upper threshold.
                "                 �"
                This object indicates that the number of MPLS resources has fallen below the lower threshold.
                "                 }"
                This object indicates that the number of MPLS resources has reached the maximum number.
                "                 "
                This object indicates that the number of MPLS resources fallen below the recovery number.
                "                 Y"
                This object indicates that the lsp was looped back.
                "                 a"
                This object indicates that loopback of the LSP is restored.
                "                 �"
                This object indicates that, after the device saves MPLS TE tunnel configurations, the device commits only some MPLS tunnel configurations.
                "                 �"
                This object indicates that, after the device saves MPLS TE tunnel configurations, the device commits all MPLS tunnel configurations.
                "                 b"This notification indicates that the data is switched from the primary CR-LSP to the HSB CR-LSP."                 b"This notification indicates that the data is switched from the HSB CR-LSP to the primary CR-LSP."                 �"This notification indicates the forward primary LSP path is the same as the reverse hot-standby LSP path, and the reverse primary LSP path is the same as the forward hot-standby LSP path, causing path mismatches."                 Q"This notification indicates that either or both path mismatches were rectified."                 H"This notification indicates the bfd status of te-lsp changes to down. "                 E"This notification indicates that the down alarm of bfd was cleared."                 V"This notification indicates that the delegation of Tunnel LSP is returned by server."                 V"This notification indicates that the delegation of Tunnel LSP is returned by server."                     "The Tunnel Interface name."                      �"The value of this object identifies the operation that an FRR configuration is committed on the tunnel.
            Options:                                                       
            1.unconfig(0) -indicates the configuration of the undo mpls te fast-reroute command is committed.  
            2.config(1)   -indicates the configuration of the mpls te fast-reroute command is committed.      
            3.unknow(2)   -indicates an unknown operation."                      b"Indicates the alarm reason as below:
                1. Other;
                2. Static LSP down;
                3. Static CR-LSP down;
                4. The out interface of the RSVP LSP ingress is down; 
                5. The resource of RSVP LSP is preempted;
                6. RSVP message timeout;
                7. RSVP neighbor lost;
                8. The bypass-tunnel is down or is unbinded with main tunnel, as bypass-tunnel is in used;
                9. CSPF compute fail;
                10.User shutdown the tunnel;
                11.TPOAM indicates the connectivity fault of the link;
                12.TPOAM indicates receive alarm indication signal defect of the link;
                13.TPOAM indicates the remote defect of the link;
                14.TPOAM indicates receive unexpected MEG-ID defect of the link;
                15.TPOAM indicates receive unexpected MEP-ID defect of the link;
                16.TPOAM indicates packet lost exceed signal fault threshold in the local link;
                17.TPOAM indicates packet unexpected period defect of the link;
                18.MPLS OAM connectivity fault;
                19.MPLS OAM TTSI excess;
                20.MPLS OAM TTSI mismatch;
                21.MPLS OAM TTSI merge error;
                22.MPLS OAM unknown error;
                23.MPLS OAM BDI;
                24.MPLS OAM FDI;
                25.MPLS OAM signal fail;
                26.MPLS OAM signal degrade;
                27.MPLS OAM fail;
                28.Service resume;
                29.Service delete;
                100. Clear."                      	H"The value of this object identifies the protocol of the lsp which exceeds the threshold or total count.
            Options:                                                       
            1.ldp(1)         -indicates the lsp is ldp lsp.  
            2.bgp(2)         -indicates the lsp is bgp lsp.
            3.bgpv6(3)         -indicates the lsp is bgpv6 lsp.
            4.ldpfrr(4)         -indicates the lsp is ldp frr lsp.
            5.rsvp(5)         -indicates the lsp is rsvp te lsp.
            6.totalLsp(6)         -indicates the lsp is total lsp.
            7.totalCrLsp(7)         -indicates the lsp is total cr-lsp.
            8.ldpIngress(8)         -indicates the lsp is ldp ingress lsp.
            9.ldpTransit(9)         -indicates the lsp is ldp transit lsp.
            10.ldpEgress(10)         -indicates the lsp is ldp egress lsp.
            11.bgpIngress(11)         -indicates the lsp is bgp ingress lsp.
            12.bgpEgress(12)         -indicates the lsp is bgp egress lsp.
            13.bgpv6Ingress(13)         -indicates the lsp is bgpv6 ingress lsp.
            14.bgpv6Egress(14)         -indicates the lsp is bgpv6 egress lsp.
            15.rsvpIngress(15)         -indicates the lsp is rsvp te ingress lsp.
            16.rsvpTransit(16)         -indicates the lsp is rsvp te transit lsp.
            17.rsvpEgress(17)         -indicates the lsp is rsvp te egress lsp.
            18.totalLspIngress(18)         -indicates the lsp is total ingress lsp.
            19.totalLspTransit(19)         -indicates the lsp is total transit lsp.
            20.totalLspEgress(20)         -indicates the lsp is total egress lsp.
            21.totalCrLspIngress(21)         -indicates the lsp is total ingress cr-lsp.
            22.totalCrLspTransit(22)         -indicates the lsp is total transit cr-lsp.
            23.totalCrLspEgress(23)         -indicates the lsp is total egress cr-lsp.
            24.totalPublicNetLspIngressTransit(24)         -indicates the lsp is total ingress and transit public netwrok lsp.
            25.totalPublicNetLspTransitEgress(25)         -indicates the lsp is total transit and egress public network cr-lsp.
            26.privateNetBgp(26)         -indicates the lsp is private network bgp lsp.    
            27.unknown(100)   -indicates the lsp type is unknown. "                       ?"The value of this object identifies the threshold of the lsp."                       D"The value of this object identifies the total permit count of lsp."                       C"The value of this object identifies the current count of the lsp."                       O"The value of this object identifies the LSR ID of the error node on a tunnel."                       X"The value of this object identifies the IP address of the error interface on a tunnel."                       ]"The value of this object identifies the IP address type of the error interface on a tunnel."                      �"The value of this object identifies that the number of MPLS resources has exceeded the threshold or the maximum number.
            Options:                                                       
            1.autoBypassTunnelIf(1)         -Indicates that the resource is auto bypass tunnel interface.  
            2.p2mpAutoTunnelIf(2)         -Indicates that the resource is P2MP auto tunnel interface.
            3.teBfd(3)         -Indicates that the resource is dynamic BFD for TE LSP.
            4.ldpBfd(4)         -Indicates that the resource is dynamic BFD for LDP LSP.
            5.mldpTotalTree(5)         -Indicates that the resource is the total number of MLDP trees.
            6.mldpTotalBranch(6)         -Indicates that the resource is the total number of MLDP branches.
            7.ldpTotalRemoteAdjacency(7)         -Indicates that the resource is LDP total remote adjacency.
            8.outSegment(8)         -Indicates that the resource is LDP outSegment.
            9.autoPrimaryTunnelIf(9)         -Indicates that the resource is auto primary tunnel interface.
            10.ldpTotalLocalAdjacency(10)         -Indicates that the resource is LDP total local adjacency.
            11.cspfNode(11)                       -Indicates that the resource is cspf node.
            12.cspfLink(12)                       -Indicates that the resource is cspf link.
            13.cspfNlsa(13)                       -Indicates that the resource is cspf nlsa.
            14.cspfSrlg(14)                       -Indicates that the resource is cspf srlg.
            15.unknown(100)   -Indicates that the resource type is unknown. "                       B"The value of this object identifies the number of the resources."                       T"The value of this object identifies the threshold for the number of the resources."                       N"The value of this object identifies the maximum number of allowed resources."                       4"The value of this object identifies the Tunnel ID."                       1"The value of this object identifies the LSP ID."                       9"The value of this object identifies the ingress LSR ID."                       8"The value of this object identifies the egress LSR ID."                       C"This object indicates the name of an bidirectional static CR-LSP."                       �"When the trap indicating that TE-Frr configuration of Tunnel is changed is sent, the cause for the change of TE-FRR configuration of Tunnel is displayed."                    "The work mode of DS-TE system, default mode is nonstandard.
                Options:
                1. standard(1)       -indicates work mode of DS-TE system is standard
                2. nonstandard(2)    -indicates work mode of DS-TE system is nonstandard"                      m"Bandwidth Constraint Model currently used by this LSR.
                Options: 
                1. rdm(1)          -indicates that the bandwidth constraint model is RDM.
                2. mam(2)          -indicates that the bandwidth constraint model is MAM.   
                3. extendMam(3)    -indicates that the bandwidth constraint model is ExtendMam."                       N"The value of this object identifies the total permit count of dynamic label."                       M"The value of this object identifies the current count of the dynamic label."                       L"The upper limit threshold value (%) of dynamic label, default value is 80."                       L"The lower limit threshold value (%) of dynamic label, default value is 70."                           �"hwMplsLspStatisticsTable is used to display the number of ingress LSPs,  
                transit LSPs, or egress LSPs of specified types. The index of this table 
                is hwMplsLspStatisticsLspType."                       �"hwMplsLspStatisticsTable is used to display the number of ingress LSPs,  
                transit LSPs, or egress LSPs of specified types. The index of this entry 
                is hwMplsLspStatisticsLspType."                      �"This object indicates the LSP type.
                Options:                                                      
                1. staticLsp(1)   -indicates the static LSP.    
                2. staticCrLsp(2) -indicates the static CR-LSP.  
                3. ldpLsp(3)      -indicates the LDP LSP.      
                4. rsvpCrLsp(4)   -indicates the RSVP LSP.     
                5. bgpLsp(5)      -indicates the BGP LSP.       
                6. asbrLsp(6)     -indicates the ASBR LSP.     
                7. bgpIpv6Lsp(7)  -indicates the BGP IPv6 LSP.  
                8. l3vpnIpv6Lsp(8)-indicates the L3VPN IPv6 LSP.
                "                       G"This object indicates the number of ingress LSPs of a specified type."                       G"This object indicates the number of transit LSPs of a specified type."                       F"This object indicates the number of egress LSPs of a specified type."                       m"This object indicates the total number of the ingress LSPs, transit LSPs and egress LSP of specified types."                       �"Indicates the traffic statistics of a LSP.                                        
                 The indexes of this table is hwMplsTrafficStatisticsStaticLspName."                       �"Indicates the traffic statistics of a LSP. The indexes of this entry is 
                hwMplsTrafficStatisticsStaticLspName."                       �"Indicates the name of the static LSP or CR-LSP. 
                The name is appointed when the static LSP or CR-LSP 
                is created."                      "An estimate of the forward of bistatic LSP's current incoming traffic statistics
                in units of bytes.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: bytes"                      "An estimate of the forward of bistatic LSP's current incoming traffic statistics
                in units of packets.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: packets"                      "An estimate of the forward of bistatic LSP's current outgoing traffic statistics
                in units of bytes.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: bytes"                      "An estimate of the forward of bistatic LSP's current outgoing traffic statistics
                in units of packets.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: packets"                      "An estimate of the backward of bistatic LSP's current incoming traffic statistics
                in units of bytes.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: bytes"                      "An estimate of the backward of bistatic LSP's current incoming traffic statistics
                in units of packets.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: packets"                      "An estimate of the backward of bistatic LSP's current outgoing traffic statistics
                in units of bytes.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: bytes"                      "An estimate of the backward of bistatic LSP's current outgoing traffic statistics
                in units of packets.
                For a sub-layer which has no concept of
                traffic statistics, this object should be zero.
                Unit: packets"                               ("Indicate the atrributes of the tunnel."                 ,"Indicate the atrributes of the static lsp."                 &"Indicate the atrributes about DS-TE."                 "Indicate LSP statistics."                 ("Indicate the OBSOLETE objects of MPLS."                 "For mpls trap object."                 "For mpls ring trap object."                 "For mpls global object."                 "For mpls lsp object."                 ,"Indicate the traffic statistic of the LSP."                 "For mpls resource object."                     "Indicate the traps."                     "Indicate the Obsolete traps."                     "hwMplsModuleCompliance"                   3"Indicates the table information of the MPLS ring."                       3"Indicates the table information of the MPLS ring."                       %"Indicates the ID of the MPLS ring. "                       8"Indicates the ID of the current Node on the MPLS ring."                       ""Indicates the name of MPLS ring."                       +"Indicates the direction of the MPLS ring."                       /"Indicates the switch reason of the MPLS ring."                           ]"
                The notification indicates that the MPLS ring switched.
                "                 \"
                The notification indicates that the MPLS ring resumed.
                "                 �"
                The notification indicates that no expected CV/FFD packet is received for three consecutive cycles in the west of the MPLS ring.
                "                 r"
                The notification indicates that the hwMplsRingWestOamLoss alarm was cleared.
                "                 �"
                The notification indicates that no expected CV/FFD packet is received for three consecutive cycles in the east of the MPLS ring.
                "                 r"
                The notification indicates that the hwMplsRingEastOamLoss alarm was cleared.
                "                 �"
                The notification indicates that RDI packets are received in the west of the MPLS ring, indicating that a fault occurs on the forward ring.
                "                 q"
                The notification indicates that the hwMplsRingWestOamRDI alarm was cleared.
                "                 �"
                The notification indicates that RDI packets are received in the east of the MPLS ring, indicating that a fault occurs on the forward ring.
                "                 q"
                The notification indicates that the hwMplsRingEastOamRDI alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level but incorrect MEG ID is received in the west of the MPLS ring.
                "                 {"
                The notification indicates that the hwMplsRingWestOamUnexpectedMEG alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level but incorrect MEG ID is received in the east of the MPLS ring.
                "                 {"
                The notification indicates that the hwMplsRingEastOamUnexpectedMEG alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level, MEG ID, 
                and MEP ID but incorrect period value is received in the west MEP of the MPLS ring.
                "                 ~"
                The notification indicates that the hwMplsRingWestOamUnexpectedPeriod alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level, MEG ID, 
                and MEP ID but incorrect period value is received in the east MEP of the MPLS ring.
                "                 ~"
                The notification indicates that the hwMplsRingEastOamUnexpectedPeriod alarm was cleared.
                "                 �"
                The notification indicates that five or more CV/FFD packets are correctly received 
                within three consecutive cycles in the west of the MPLS ring.
                "                 t"
                The notification indicates that the hwMplsRingWestOamExcess alarm was cleared.
                "                 �"
                The notification indicates that five or more CV/FFD packets are correctly received 
                within three consecutive cycles in the east of the MPLS ring.
                "                 t"
                The notification indicates that the hwMplsRingEastOamExcess alarm was cleared.
                "                 �"
                The notification indicates that the number of packets for connectivity check received 
                in the west of the MPLS ring is smaller than the SD threshold.
                "                 p"
                The notification indicates that the hwMplsRingWestOamSD alarm was cleared.
                "                 �"
                The notification indicates that the number of packets for connectivity check received 
                in the east of the MPLS ring is smaller than the SD threshold.
                "                 p"
                The notification indicates that the hwMplsRingEastOamSD alarm was cleared.
                "                 �"
                The notification indicates that the number of packets for connectivity check received in 
                the west of the MPLS ring is smaller than the SF threshold.
                "                 p"
                The notification indicates that the hwMplsRingWestOamSF alarm was cleared.
                "                 �"
                The notification indicates that the number of packets for connectivity check received in 
                the east of the MPLS ring is smaller than the SF threshold.
                "                 p"
                The notification indicates that the hwMplsRingEastOamSF alarm was cleared.
                "                 x"
                The notification indicates that APS switching occurs in the west of the MPLS ring.
                "                 u"
                The notification indicates that APS switches back in the west of the MPLS ring.
                "                 x"
                The notification indicates that APS switching occurs in the east of the MPLS ring.
                "                 u"
                The notification indicates that APS switches back in the east of the MPLS ring.
                "                 �"
                The notification indicates that the remote APS switching fails in the west of the MPLS ring.
                "                 x"
                The notification indicates that the hwMplsRingWestAPSSwitchFail alarm was cleared.
                "                 �"
                The notification indicates that the remote APS switching fails in the east of the MPLS ring.
                "                 x"
                The notification indicates that the hwMplsRingEastAPSSwitchFail alarm was cleared.
                "                 {"
                The notification indicates that APS packets are missing in the west of the MPLS ring.
                "                 r"
                The notification indicates that the hwMplsRingWestAPSLost alarm was cleared.
                "                 {"
                The notification indicates that APS packets are missing in the east of the MPLS ring.
                "                 r"
                The notification indicates that the hwMplsRingEastAPSLost alarm was cleared.
                "                 �"
                The notification indicates that the source ID carried by APS packets received in the west 
                is different from the peer source ID configured for the west state machine on the MPLS ring.
                "                 v"
                The notification indicates that the hwMplsRingWestAPSMismatch alarm was cleared.
                "                 �"
                The notification indicates that the source ID carried by APS packets received in the east 
                is different from the peer source ID configured for the east state machine on the MPLS ring.
                "                 v"
                The notification indicates that the hwMplsRingEastAPSMismatch alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level and correct MEG ID but not the expected MEP ID is received in the west of the MPLS ring.
                "                 {"
                The notification indicates that the hwMplsRingWestOamUnexpectedMEP alarm was cleared.
                "                 �"
                The notification indicates that a CCM frame carrying a correct MEG level and correct MEG ID but not the expected MEP ID is received in the east of the MPLS ring.
                "                 {"
                The notification indicates that the hwMplsRingEastOamUnexpectedMEP alarm was cleared.
                "                                