e-- ==================================================================
-- Copyright (C) 2017 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI PWE3 Management MIB
-- Reference:
-- Version: V2.13
-- History:
--              V1.0 PanJun, 2006-05-10, publish
-- ==================================================================
   /"The type indicates the type of the LDP PW VC."              s"The type indicates the reason of LDP PW VC's status change:
                LDP session down (1) 
                AC interface down (2) 
                PSN tunnel state down (3) 
                Mapping message not received (4)
                PW interface parameter not match (5)
                Notification not forwarding (6)                
                "                                                                     G"The HUAWEI-PWE3-MIB contains objects to
                manage PWE3.""Huawei Industrial Base
                  Bantian, Longgang
                   Shenzhen 518129
                   People's Republic of China
                   Website: http://www.huawei.com
                   Email: support@huawei.com
                 " "201708171724Z" "201601121800Z" "201512281700Z" "201511281600Z" "201507181600Z" "201507141600Z" "201504071600Z" "201410271600Z" "201410271600Z" "201410081600Z" "201402111600Z" "201308291100Z" "201307131100Z" "201306181100Z" *"Modify the description of hwSvcExtPWType" *"Modify the description of hwSvcExtPWType" `"Add OBJECT(hwSvcExtCir, hwSvcExtPir,hwSvcExtQosProfile) to SVC MIB Extend Table(hwSvcExtTable)" ("Support query the secondary static VCs" )"Add ifName to hwRemoteApPwParaMisMatch " 0"Add PWE3 MIB Trap(hwVpwsPwRedundancyDegraded)." ("Modify the description of hwSvcActive." 0"Add PWE3 MIB Trap(hwVpwsPwRedundancyDegraded)." 5"Add PWE3 MIB Trap(hwVpwsPwRedundancyDegradedClear)." �"Modify the description of hwSvcForBfdIndex,hwSvcDelayTime, hwSvcReroutePolicy,
              hwSvcRerouteReason, hwSvcLastRerouteTime." �"The max length of hwPWVcQosProfile,hwPWVcSwitchQosProfile, hwPwVcSwitchBackupVcQosProfile,
              hwSvcQosProfile, hwPWTemplateQosProfile changed from 31 to 63." )" Add PWE3 MIB Trap(hwPWVcStatusChange)." �"Add OBJECT(hwL2vpnTnlType, hwL2vpnTunnelIndex) to SVC MIB Trap(hwSvcDown);  
             Add OBJECT(hwL2vpnTnlType, hwL2vpnTunnelIndex) to PWE3 MIB Trap(hwPWVcDown)." �"Add OBJECT(hwSvcActive) to SVC MIB Trap(hwSvcDown,hwSvcUp); 
                 Add OBJECT(hwPWVcActive) to PWE3 MIB Trap(hwPWVcDown,hwPWVcUp,hwPWVcBackup)."       --Aug 17, 2017 at 17:24 GMT 
               c"This table is the VC configuration table. Users
                can create or delete a VC by it."                       )"Provides the information of a VC entry."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element'."                       o"The type of the Virtual Circuit.This value indicate the service to be carried over 
                this PW."                       �"Denotes the address type of the peer node. It should be  
                set to 'unknown' if PE/PW maintenance protocol is not used 
                and the address is unknown.
                Currently, support 'ipv4' only."                       "This object contain the value of the peer node address 
                of the PW/PE maintenance protocol entity. This object  
                SHOULD contain a value of all zeroes if not applicable  
                (hwPWVcPeerAddrType is 'unknown')."                       h"Indicates the status of the PW in the local node.
                Currently, can't support 'plugout'."                       G"The value of this object identifies the incoming label value of a PW."                       G"The value of this object identifies the outgoing label value of a PW."                       0"This object indicates the type of a switch PW."                       o"Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element' of the switch PW."                       �"Denotes the address type of the peer node of the switch PW.
                It should be set to 'unknown' if PE/PW maintenance protocol
                is not used and the address is unknown.
                Currently, support 'ipv4' only."                      "This object contain the value of the peer node address of the
                switch PW of the PW/PE maintenance protocol entity. This object  
                SHOULD contain a value of all zeroes if not applicable  
                (hwPWVcSwitchPeerAddrType is 'unknown')."                       N"The value of this object identifies the incoming label value of a switch PW."                       N"The value of this object identifies the outgoing label value of a switch PW."                      @"Used in the Group ID field sent to the peer PWES  
                within the maintenance protocol used for PW setup. 
                Applicable if pwVcOwner equal 'pwIdFecSignaling' or  
                'l2tpControlProtocol', should be set to zero otherwise.
                Currently, this value always be zero."                       ]"Index of the interface (or the virtual interface) 
                associated with the PW."                       G"Local AC status.
                Currently, can't support 'plugout'."                       2"Denotes the AC's protocol is operational or not."                      ""If not equal zero, the optional Mtu object in the  
                signaling protocol will be sent with this value,  
                representing the locally supported MTU size over the  
                interface (or the virtual interface) associated with the  
                PW."                      
"If signaling is used for PW establishment, this object  
                indicates the status of the control word negotiation,  
                and in both signaling or manual configuration indicates  
                if CW is to be present or not for this PW."                       ="The value of this object identifies the VCCV value of a PW."                       @"This object indicates the bandwidth. '0' is the default value."                       7"Indicates the max cell supported when vc type is atm."                       ("Indicates the tunnel policy name used."                       �"Indicates the traffic behavior Index when QOS is implemented.
                Currently,can't support.Return the default value is '0'."                       P"Indicates the explicit path name set by the operator.Currently, can't support."                       -"Indicates the PW template index referenced."                       4"Indicates whether or not the secondary PW is used."                       ^"Indicates the duration when the PW keeps Up for 
                the last time, in seconds."                       7"This object indicates whether OAM mapping is enabled."                       "The index of PW for BFD."                       "The reroute delay time."                       "Reroute policy."                       "The reroute resume time."                       "Last reroute reason."                       "Last reroute time."                       Z"This object indicates that faults on the primary or secondary PW are manually simulated."                       *"Denotes the current vc is active or not."                       l"The value of this object identifies the index of the AC interface bound to a management VRRP backup group."                       O"The value of this object identifies the ID of a management VRRP backup group."                       !"The multiple of detection time."                       e"The value of this object identifies the minimum interval at which dynamic BFD packets are received."                       a"The value of this object identifies the minimum interval at which dynamic BFD packets are sent."                       H"This value indicates the capacitability to support dynamic BFD detect."                       ?"The value of this object identifies the VC ID of the peer PW."                       +"This value indicates the type of ETH OAM."                       0"This value indicates the current CFM MA index."                       ."Specifies the time this PW status was Up(1)."                       Q"Indicates the accumulated time when the VC is Up, 
                in seconds."                       \"Name of the interface (or the virtual interface) 
                associated with the PW."                       �"RowStatus for this Table.
                Restriction:
                  The row must be created by 'createAndGo' handle only.
                  Handle 'createAndWait' is forbidden.
                  Not support modifying configuration."                       H"The value of this object identifies the ATM cell encapsulation period."                       J"The value of this object identifies the jitter buffer depth for TDMoPSN."                       `"The value of this object identifies the number of TDM frames encapsulated in a TDMoPSN packet."                       g"The value of this object identifies the filling idle code used when a jitter buffer underflow occurs."                       X"This object indicates the RTP header carried in a transparently transmitted TDM frame."                       _"This object indicates the tunnel policy name for the tunnel to which a switch PW is iterated."                       0"This value indicates the current CFM MD index."                       4"This value indicates the current CFM MA name used."                       4"This value indicates the current CFM MD name used."                       4"Specifies whether the raw or tagged is configured."                       2"Specifies the interworking type of the VC entry."                       B"Specifies the committed information rate, based on the VC entry."                       ="Specifies the peak information rate, based on the VC entry."                       :"Specifies the QoS profile's name, based on the VC entry."                       I"Specifies the committed information rate, based on the switch VC entry."                       D"Specifies the peak information rate, based on the switch VC entry."                       A"Specifies the QoS profile's name, based on the switch VC entry."                       <"Specifies whether the PW remote interface shutdown or not."                       L"Specifies whether ACOAM detection and notification are all enabled or not."                       6"Denotes the VRRP interface the switch PW binding to."                       ,"Denotes the VrID the switch PW binding to."                       l"This object indicates the configuration of the Qos parameters managed through command line or PW template."                       l"This object indicates the configuration of the Bfd parameters managed through command line or PW template."                       I"This object indicates the negotiation mode of the PW on the local node."                       8"This object indicates whether the PW is the bypass PW."                       ?"This object indicates whether the PW is the administrator PW."                       �"This object indicates the index of the interface on which the administrator PW resides after it is being tracked by the service PW."                       g"This object indicates the status of the administrator PW after it is being tracked by the service PW."                       �"This object indicates the index of the interface on which the administrator PW resides after it is being tracked by the switch PW."                       f"This object indicates the status of the administrator PW after it is being tracked by the switch PW."                       �"This object indicates the index of the interface on which the administrator PW resides after it is being tracked by the switch backup PW."                       m"This object indicates the status of the administrator PW after it is being tracked by the switch backup PW."                       :"This object indicates the VC ID of the switch backup PW."                       �"This object indicates type of the IP address of the peer on the switch backup PW.
                 Currently, only IPv4 addresss are supported."                       K"This object indicates the IP address of the peer on the switch backup PW."                       �"This object indicates the inbound label of the switch backup VC.
                 For a static VC, the value of the inbound label ranges from 16 to 1023.
                 For a dynamic VC, the inbound label is automatically generated by the system."                      "This object indicates the outbound label of the switch backup VC. 
                 For a static VC, the value of the outbound label ranges from 0 to 1048575.
                 For a dynamic VC, the outbound label is automatically generated by the system."                       N"This object indicates the name of the tunnel policy of the switch backup VC."                       8"This object indicates the CIR of the switch backup VC."                       8"This object indicates the PIR of the switch backup VC."                       L"This object indicates the name of the QoS profile of the switch backup VC."                       H"This object indicates whether the status of the VC is master or slave."                       O"This object indicates whether the status of the switch VC is master or slave."                       V"This object indicates whether the status of the switch backup VC is master or slave."                       M"This object indicates whether the status of the switch VC is active or not."                       T"This object indicates whether the status of the switch backup VC is active or not."                       a"This object indicates whether the SPE support Control Word Transparent or not,default is false."                       :"This object indicates the service name of the switch VC."                       A"This object indicates the service name of the switch backup VC."                       8"This table is used to search the tunnel index of a VC."                       0"Provides the information of a VC tunnel entry."                       3"This object indicates the tunnel index of the VC."                       ("This object indicates the tunnel type."                       1"This object indicates the index of LSP for BFD."                       7"This table contains the Pwe3's VC packets statistics."                       P"Provides the information of the Pwe3's VC packets
                statistics."                       2"The total number of packets received on this VC."                       0"The total number of bytes received on this VC."                       ."The total number of packets sent on this VC."                       +"The total number of bytes sent on the VC."                       Q"This table provides remote PW information for  
                each local PW."                       P"An entry in this table is created by the agent for 
                every PW."                       o"Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element' of the remote PW."                       U"This value indicate the service to be carried over 
                the remote PW."                       3"Indicates the forwarding status of the remote VC."                       g"Indicates the Group ID field of the remote PW.
                Currently, this value always be zero."                       4"Indicates the supported MTU size of the remote PW."                       9"Indicates the control word capability of the remote PW."                       Y"Indicates the max cell supported of the remote PW 
                when vctype is atm."                       7"Indicates notification is supported by the remote PW."                      "If this object is set to enable(1), then it enables 
                the emission of hwPWVcSwitchWtoP and hwPWVcSwitchPtoW 
                notifications; otherwise these notifications are not 
                emitted.
                The default value is disable (2)."                       �"This object indicates the enable sign of PW VC state
                change notification.
                The default value is disable (2)."                       �"This object indicates the enable sign of PW VC deletion
                notification.
                The default value is disable (2)."                       :"This object indicates the cause of the VC status change."                       c"This object indicates the VC ID of PW
                switch between working PW and protect PW ."                       P"This object indicates the reason of LDP PW VC's
                state change."                       �"This table provides per TDM PW performance information. The contents of this
          table entry are reset to zero and gotten new information every 15 minutes."                       H"An entry in this table is created by the agent for every TDM PW entry."                       a"Number of missing packets (as detected via control word
                sequence number gaps)."                       0"Number of times the jitter buffer was overrun."                       c"Number of times a packet needed to be played
               out and the jitter buffer was empty."                       �"Number of packets detected out of order (via control word
                sequence numbers) that could not be re-ordered or could
                not fit in the jitter buffer."                       Y"Number of packets detected with unexpected size or
                bad headers' stack."                       �"The counter associated with the number of Error
                 Seconds encountered.  Any malformed packet, sequence error,
                 LOPS, and the like are considered as Error Seconds."                       a"The counter associated with the number of
                 Severely Error Seconds encountered."                       �"The counter associated with the number of
                 Unavailable Seconds encountered.  Any consecutive
                 ten seconds of SES are counted as one Unavailable
                 Seconds (UAS)."                           d"This notification is generated when switch from working
                PW to protect PW happens."                 d"This notification is generated when switch from protect
                PW to working PW happens."                 ="This notification indicates the VC's state changes to down."                 ;"This notification indicates the VC's state changes to up."                 0"This notification indicates the VC is deleted."                 ?"This notification indicates the VC's state changes to backup."                 D"This notification indicates the LDP PW VC's state changes to down."                 B"This notification indicates the Ldp PW VC's state changes to up."                 <"This notification indicates the VC's Active state changed."                 7"VPWS PW redundancy reported a protect degraded alarm."                 I"VPWS PW redundancy reported the clearing of the protect degraded alarm."                 }"This notification indicates the low-speed interface parameter settings reported by the remoter AP mismatch those of the PW."                 z"This notification indicates the low-speed interface parameter settings reported by the remoter AP match those of the PW."                     e"This table is the SVC configuration table. Users
                can create or delete a SVC by it."                       *"Provides the information of a SVC entry."                       ]"Index of the interface (or the virtual interface) 
                associated with the PW."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element'."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.This value indicate the service to be carried over 
                this PW."                       �"Denotes the address type of the peer node. It should be  
                set to 'unknown' if PE/PW maintenance protocol is not used 
                and the address is unknown.
                Currently, support 'ipv4' only."                       �"This object contain the value of the peer node address 
                of the PW/PE maintenance protocol entity. This object  
                SHOULD contain a value of all zeroes if not applicable  
                (hwSvcPeerAddrType is 'unknown')."                       h"Indicates the status of the PW in the local node.
                Currently, can't support 'plugout'."                       *"This object indicates the inbound label."                       +"This object indicates the outbound label."                      ?"Used in the Group ID field sent to the peer PWES  
                within the maintenance protocol used for PW setup. 
                Applicable if SvcOwner equal 'pwIdFecSignaling' or  
                'l2tpControlProtocol', should be set to zero otherwise.
                Currently, this value always be zero."                       G"Local AC status.
                Currently, can't support 'plugout'."                       2"Denotes the AC's protocol is operational or not."                      T"If not equal zero, the optional Mtu object in the  
                signaling protocol will be sent with this value,  
                representing the locally supported MTU size over the  
                interface (or the virtual interface) associated with the  
                PW.Currently, can't support.'0' is the default value."                      
"If signaling is used for PW establishment, this object  
                indicates the status of the control word negotiation,  
                and in both signaling or manual configuration indicates  
                if CW is to be present or not for this PW."                      E"Indicates the optional VCCV capabilities of the SVC.
                According to whether the control word is enabled, 
                the value can be ccCw(0)|ccAlert(1)|cvLspping(4)|cvBfd(5) 
                or ccAlert(1)|cvLspping(4)|cvBfd(5). The default 
                value is ccAlert(1)|cvLspping(4)|cvBfd(5)."                       X"This object indicates the bandwidth.Currently, can't support.'0' is the default value."                       7"Indicates the max cell supported when vc type is atm."                       ("Indicates the tunnel policy name used."                       �"Indicates the traffic behavior Index when QOS is implemented.
                Currently, can't support.'0' is the default value."                       -"Indicates the PW template index referenced."                       _"Indicates the duration when the SVC keeps Up 
                for the last time, in seconds."                       +"Denotes the AC and PSN are enable or not."                       "The index of PW for BFD."                       q"Indicates whether or not the secondary PW is used.Currently, can't support.Return the default value is 'false'."                       "The reroute delay time."                       "Reroute policy."                       S"The reroute resume time.Currently, can't support.Return the default value is '0'."                       "Last reroute reason."                       "Last  reroute time."                       l"Denotes the manual has been set fault or not.Currently, can't support.Return the default value is 'false'."                       *"Denotes the current vc is active or not."                       ."Specifies the time this PW status was Up(1)."                       R"Indicates the accumulated time when the SVC is Up, 
                in seconds."                        "Specifies the AtmPackOvertime."                       $"Specifies the PwJitterBufferDepth."                       &"Specifies the PwTdmEncapsulationNum."                       "Specifies the PwIdleCode."                       "Specifies the PwRtpHeader."                       J"Specifies whether the VLAN tag of the SVC entry is attached or stripped."                       3"Specifies the interworking type of the SVC entry."                       C"Specifies the committed information rate, based on the SVC entry."                       >"Specifies the peak information rate, based on the SVC entry."                       ;"Specifies the QoS profile's name, based on the SVC entry."                       �"RowStatus for this Table.
                Restriction:
                  The row must be created by 'createAndGo' handle only.
                  Handle 'createAndWait' is forbidden.
                  Not support modifying configuration."                       9"This table is used to search the tunnel index of a SVC."                       1"Provides the information of a SVC tunnel entry."                       4"This object indicates the tunnel index of the SVC."                       ("This object indicates the tunnel type."                       |"This object indicates the index of LSP for BFD.
                Currently, can't support.Return the default value is '0'."                       9"This table contains the L2vpn's SVC packets statistics."                       R"Provides the information of the L2VPN's SVC packets
                Statistics."                       3"The total number of packets received on this SVC."                       1"The total number of bytes received on this SVC."                       /"The total number of packets sent on this SVC."                       ,"The total number of bytes sent on the SVC."                       a"This table is the SVC configuration extend table. Users
                can query a SVC by it."                       *"Provides the information of a SVC entry."                       ]"Index of the interface (or the virtual interface) 
                associated with the PW."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.This value indicate the type of the LDP PW VC."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element'."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.This value indicate the service to be carried over 
                this PW."                       �"Denotes the address type of the peer node. It should be  
                set to 'unknown' if PE/PW maintenance protocol is not used 
                and the address is unknown.
                Currently, support 'ipv4' only."                      "This object contain the value of the peer node address 
                of the PW/PE maintenance protocol entity. This object  
                SHOULD contain a value of all zeroes if not applicable  
                (hwSvcExtPeerAddrType is 'unknown')."                       h"Indicates the status of the PW in the local node.
                Currently, can't support 'plugout'."                       *"This object indicates the inbound label."                       +"This object indicates the outbound label."                       G"Local AC status.
                Currently, can't support 'plugout'."                       2"Denotes the AC's protocol is operational or not."                      
"If signaling is used for PW establishment, this object  
                indicates the status of the control word negotiation,  
                and in both signaling or manual configuration indicates  
                if CW is to be present or not for this PW."                      E"Indicates the optional VCCV capabilities of the SVC.
                According to whether the control word is enabled, 
                the value can be ccCw(0)|ccAlert(1)|cvLspping(4)|cvBfd(5) 
                or ccAlert(1)|cvLspping(4)|cvBfd(5). The default 
                value is ccAlert(1)|cvLspping(4)|cvBfd(5)."                       7"Indicates the max cell supported when vc type is atm."                       ("Indicates the tunnel policy name used."                       -"Indicates the PW template index referenced."                       _"Indicates the duration when the SVC keeps Up 
                for the last time, in seconds."                       +"Denotes the AC and PSN are enable or not."                       S"The index of PW for BFD.Currently, can't support.Return the default value is '0'."                       q"Indicates whether or not the secondary PW is used.Currently, can't support.Return the default value is 'false'."                       R"The reroute delay time.Currently, can't support.Return the default value is '0'."                       S"Reroute policy.Currently, can't support.Return the default value is 'invalid(6)'."                       ^"Last reroute reason.Currently, can't support.Return the default value is 'invalidReason(1)'."                       N"Last  reroute time.Currently, can't support.Return the default value is '0'."                       l"Denotes the manual has been set fault or not.Currently, can't support.Return the default value is 'false'."                       g"Denotes the current vc is active or not.Currently, can't support.Return the default value is 'false'."                       ."Specifies the time this PW status was Up(1)."                       R"Indicates the accumulated time when the SVC is Up, 
                in seconds."                        "Specifies the AtmPackOvertime."                       $"Specifies the PwJitterBufferDepth."                       &"Specifies the PwTdmEncapsulationNum."                       "Specifies the PwIdleCode."                       "Specifies the PwRtpHeader."                       J"Specifies whether the VLAN tag of the SVC entry is attached or stripped."                       3"Specifies the interworking type of the SVC entry."                       �"RowStatus for this Table.
                Restriction:
                  The row must be created by 'createAndGo' handle only.
                  Handle 'createAndWait' is forbidden.
                  Not support modifying configuration."                       C"Specifies the committed information rate, based on the SVC entry."                       >"Specifies the peak information rate, based on the SVC entry."                       ;"Specifies the QoS profile's name, based on the SVC entry."                      )"If this object is set to enable(1), then it enables 
                the emission of hwSvcSwitchWtoP and hwSvcSwitchPtoW 
                notifications; otherwise these notifications are not 
                emitted.Currently, can't support.
                The default value is disable (2)."                       �"This object indicates the enable sign of PW VC state
                change notification.
                The default value is disable (2)."                       �"This object indicates the enable sign of PW VC deletion
                notification.
                The default value is disable (2)."                       J"This object indicates the reason of PE VC
                state change."                           }"This notification is generated when switch from working
                PW to protect PW happens.Currently, can't support."                 }"This notification is generated when switch from protect
                PW to working PW happens.Currently, can't support."                 >"This notification indicates the SVC's state changes to down."                 <"This notification indicates the SVC's state changes to up."                 1"This notification indicates the SVC is deleted."                 j"This table specifies information for configuring and 
                status monitoring to PW tempalte."                       �"A row in this table represents a pseudo wire (PW) template. 
                It is indexed by hwPWCmdTemplateIndex, which uniquely 
                identifying a singular tempalte."                      Z"The name of the PW template.
                Set by the operator to indicate the protocol responsible  
                for establishing this PW. The value 'static' is used in all 
                cases where no maintenance protocol (PW signaling) is used  
                to set-up the PW, i.e. require configuration of entries in 
                the PW tables including PW labels, etc. The value 'ldp' is 
                used in case of signaling with the PWid FEC element with LDP 
                signaling. The value 'rsvp' indicate the use of rsvp  
                control protocol."                       �"Denotes the address type of the peer node. It should be  
                set to 'unknown' if PE/PW maintenance protocol is not used 
                and the address is unknown.
                Currently, support 'ipv4' only."                       u"This object contain the value of the peer node address 
                of the PW/PE maintenance protocol entity. "                       9"Indicates the control word capability of the switch PW."                      h"Indicates the optional VCCV capabilities of the PW template.
                According to whether the control word is enabled, 
                the value can be ccCw(0)|ccAlert(1)|ccTtl(6)|cvLspping(4)|cvBfd(5) 
                or ccAlert(1)|ccTtl(6)|cvLspping(4)|cvBfd(5). The default 
                value is ccAlert(1)|ccTtl(6)|cvLspping(4)|cvBfd(5)."                       5"Indicates whether or not fragmentaion is supported."                       "Indicates the bandwitdh when signaling protocol is rsvp. 
                Currently, can't support.'0' is the default value."                       ("Indicates the tunnel policy name used."                       �"Indicates the traffic behavior Index when QOS is
                implemented.Currently, can't support.'0' is the default value."                       P"Indicates the explicit path name set by the operator.Currently, can't support."                       !"The multiple of detection time."                       ."The interval of bfd messages to be received."                       *"The interval of bfd messages to be sent."                       H"This value indicates the capacitability to support dynamic BFD detect."                       "Specifies the MaxAtmCells."                        "Specifies the AtmPackOvertime."                       $"Specifies the PwJitterBufferDepth."                       &"Specifies the PwTdmEncapsulationNum."                       "Specifies the PwIdleCode."                       "Specifies the PwRtpHeader."                       -"Specifies the CC Sequence is enable or not."                       K"Specifies the committed information rate, based on the PW template entry."                       F"Specifies the peak information rate, based on the PW template entry."                       C"Specifies the QoS profile's name, based on the PW template entry."                       J"The value of this object identifies whether the PW FlowLabel is enabled."                       �"RowStatus for this Table.
                Restriction:
                  The row must be created by 'createAndGo' handle only.
                  Handle 'createAndWait' is forbidden."                           ?"This notification indicates the PWTemplate cannot be deleted."                     8"This table indicates a PW, that is Static PW or LDP PW"                       -"Provides the information of a VC key entry."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element'."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.This value indicate the service to be carried over 
                this PW."                       �"This object contain the value of the peer node address 
                of the PW/PE maintenance protocol entity. This object  
                SHOULD contain a value of all zeroes if not applicable."                       ]"Index of the interface (or the virtual interface) 
                associated with the PW."                               X"The compliance statement for systems supporting 
                the HUAWEI-PWE3-MIB."                   "The Pwe3's VC group."                 "The PWE3's VC Tunnel group."                 !"The PWE3's VC Statistics group."                 "The PWE3's Remote VC group."                 "The PWE3's Template group."                 ("The PWE3's Notification Control group."                 #"The PWE3's Vc State Reason group."                 #"The PWE3's VC Notification group."                     #"The LDP PW VC State Reason group."                 2"The PWE3's VC TDM performance information group."                     "The L2vpn's SVC group."                 "The L2vpn's SVC Tunnel group."                 #"The L2vpn's SVC Statistics group."                 -"The L2vpn SVC's Notification Control group."                 %"The L2vpn's SVc State Reason group."                 %"The L2vpn's SVC Notification group."                         "The PW Table Group."                     -"The L2vpn's PW Template Notification group."                                