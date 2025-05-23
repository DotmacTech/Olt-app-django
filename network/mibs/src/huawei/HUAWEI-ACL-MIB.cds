v-- ====================================================================
-- Copyright (C) 2021 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: Huawei Acl MIB Definition
-- Reference:   Huawei Enterprise MIB
-- Version:     V2.31
-- History:
--         Version:     V2.0
--             Wang Ning,2002-11-29,Reunification version based on the Fix-Net MIBs 
--             baseline by the MIB Standard community.
--         Version:     V2.1
--             Yang Hongjie,2003-04-11,Reunification version based on V2.0.
--         Version:     V2.2
--             Yang Yuhui,2004-05-17,Reunification version based on V2.1.
--         Version:     V2.3
--             Xu xinjun, 2009-04-13.
--             1, Add five new rule tables based on V2.2.
--                 hwAclEthernetFrameRuleTable, hwAclIpv6BasicRuleTable,
--                 hwAclIpv6AdvanceRuleTable, hwAclIpv6NumGroupTable, 
--                 hwAclIpv6IfRuleTable.
--             2, Change Name-ACL range from [42768..45767] to [42768..59151]
--         Version:     V2.04
--             wen shuangquan, 2014-01-17.
--             1, Add two new rule nodes based on V2.0.3
--                 hwAclAdvancedProtocolNew, hwAclIpv6AdvancedProtocolNew.
--         Version:     V2.05
--             wang chengyuan, 2014-03-25.
--             1, Add acl resource trap table based on V2.0.4
--         Version:     V2.06
--             zhang liang, 2014-04-09.
--             1, Add acl resource trap table based on V2.0.5
--         Version:     V2.07
--             zhengfeng, 2014-06-20.
--             1, Add hwAclAdvancedVni, hwAclAdvancedIgmpType, hwAclAdvancedTtlOp, hwAclAdvancedTtlExpire, hwAclAdvancedTtlExpireEnd  based on V2.0.6
--         Version:     V2.08
--             zhang liang, 2014-08-05.
--             1, Chang  hwAclNumGroupAclName in hwAclIpv6NumGroupTable and hwAclIpv6NumGroupAclName in hwAclNumGroupTable  value length on V2.0.7
--         Version:     V2.09
--             chenyang, 2014-10-28.
--             1, Add hwAclAdvancedPktLenOp, hwAclAdvancedPktLenBegin and hwAclAdvancedPktLenEnd in hwAclAdvancedRuleTable,  based on V2.0.8
--             chenyang, 2015-02-07.
--             1, Add hwAclAdvancedTcpFlagMask in hwAclAdvancedRuleTable,  based on V2.0.9
--         Version:     V2.11
--             suxunjin, 2015-2-27.
--             1, Add hwAclUserDestDomainName in hwAclUserRuleTable, Add hwAclDomainNameConfigTable based on V2.10
--         Version:     V2.12
--             chenyang, 2015-11-27.
--             1, Add hwAclAdvancedSrcPortPoolName and hwAclAdvancedDestPortPoolName in hwAclAdvancedRuleTable, based on V2.11
--             2, Add hwAclIPPoolTable, hwAclIPPoolIPTable, hwAclPortPoolTable and hwAclPortPoolPortTable, based on V2.11
--         Version:     V2.13
--             mengfanlu, 2015-12-17.
--             1, Add hwAclIfDescription in hwAclIfRuleTable, based on V2.12
--         Version:     V2.14
--             chenyang, 2016-02-24.
--             1, Add hwAclAdvancedIcmpTypeEnd in hwAclAdvancedRuleTable, based on V2.13
--             2, Add hwAclIpv6AdvancedIcmpTypeEnd in hwAclIpv6AdvancedRuleTable, based on V2.13
--         Version:     V2.15
--             chenyang, 2016-05-6.
--             1, Add hwAclBasicVrfAny in hwAclBasicRuleTable, based on V2.14
--             2, Add hwAclAdvancedVrfAny in hwAclAdvancedRuleTable, based on V2.14
--             3, Add hwAclIpv6BasicVrfAny in hwAclIpv6BasicRuleTable, based on V2.14
--             4, Add hwAclIpv6AdvancedVrfAny in hwAclIpv6AdvancedRuleTable, based on V2.14
--         Version:     V2.16
--             qihui, 2016-08-26.
--             1, hwAclIpv6NumGroupAclType, add key interface(3), based on V2.15
--         Version:     V2.17
--             fuzhichao, 2016-12-26.
--             1, Add hwAclIpv6AdvancedSrcPoolName in hwAclIpv6AdvancedRuleTable, based on V2.16
--             2, Add hwAclIPPoolApplyBGPPeer in hwAclIPPoolTable, based on V2.16
--             3, Add hwAclIPPool6Table, based on V2.16
--         Version:     V2.18
--             fuzhichao, 2017-6-6.
--             1, Add hwAclIpv6AdvancedVni in hwAclIpv6AdvancedRuleTable, based on V2.17
--         Version:     V2.19
--             qiujindou, 2017-7-3.
--             1, Amend some English descriptions, based on V2.18
--         Version:     V2.21
--             chenyang, 2018-5-22.
--             1, Add hwAclIpv6AdvancedTcpFlag and hwAclIpv6AdvancedTcpFlagMask in hwAclIpv6AdvancedRuleTable, based on V2.20
--         Version:     V2.22
--             chenyang, 2018-6-1.
--             1, Change description of hwAclAdvancedPrecedence, hwAclAdvancedTos and hwAclAdvancedDscp in hwAclAdvancedRuleTable, based on V2.21
--             2, Change description of hwAclIpv6AdvancedPrecedence, hwAclIpv6AdvancedTos and hwAclIpv6AdvancedDscp in hwAclIpv6AdvancedRuleTable, based on V2.21
--         Version:     V2.23
--             tanminghuan, 2019-5-6.
--             1, Add hwAclIpv6UserRuleTable , based on V2.23
--         Version:     V2.24
--             zhanjianhui, 2019-11-30.
--             1, Add hwAclIpv6BasicSrcWild, hwAclIpv6AdvancedSrcWild and hwAclIpv6AdvancedDestWild, based on V2.23
--         Version:     V2.25
--             zhuzhiyong, 2020-04-08.
--             1, hwAclIpv6NumGroupAclType, add key ucl(4), based on V2.24
--         Version:     V2.26
--             zhuzhiyong, 2020-05-29.
--             1, Add hwCounterResourceTrapsTable and hwMeterResourceTrapsTable, based on V2.25
--         Version:     V2.27
--             liuhuan, 2020-07-23.
--             1, Correct wrong translation information, based on V2.26
--         Version:     V2.28
--             zhangye, 2020-09-19.
--             1, Modified the description of hwAclNumGroupAclNum, based on V2.27
--         Version:     V2.29
--             zhangye, 2021-01-05.
--             1, Modified the description of hwAclNumGroupAclNum, based on V2.28
--         Version:     V2.30
--             hanyaohui, 2021-03-01.
--             1, Modified the description of hwAclResourceInfoTrap, based on V2.29
-- ========================================================================
                                                                �"The HUAWEI-ACL-MIB contains objects to configure ACL module, 
            including ACL group, rule and acl accelerate,
            and query the current ACL configuration and status.
            This MIB module objects indicate hwAclNumGroupTable, hwAclBasicRuleTable,
            hwAclAdvanceRuleTable, hwAclIfRuleTable, hwAclEthernetFrameRuleTable, 
            hwAclIpv6BasicRuleTable, hwAclIpv6AdvanceRuleTable, hwAclIpv6IfRuleTable,
            hwAclCompileEnableFlag, hwAclCompileNumGroupTable, 
            hwAclIpv6NumGroupTable and acl trap.
                  
            To filter data packets, a series of rules need to be configured 
            on the device. These rules are defined by ACL (Access Control List), 
            which are a series of sequential rules consisting of rule 
            permit or deny statements. The rules are described by source 
            address, destination address and port number of data packets. 
            ACL classifies data packets through these device interface applied
            rules, by which the device decides which packets can be received 
            and which should be rejected.""Huawei Industrial Base            
             Bantian, Longgang                 
              Shenzhen 518129                   
              People's Republic of China        
              Website: http://www.huawei.com    
              Email: support@huawei.com" "202110262112Z" "202103012111Z" "202101051016Z" "202009191457Z" "202007231140Z" "202005290941Z" "202004081106Z" "201911301714Z" "201905062200Z" "201806012200Z" "201805221200Z" "201708171200Z" "201707031200Z" "201706061200Z" "201612261200Z" "201608260000Z" "201605061200Z" "201602241200Z" "201512172100Z" "201511272100Z" "201502272100Z" "201502072100Z" "201410282100Z" "201408051606Z" "201406200948Z" "201404090948Z" "201403260926Z" "201401171338Z" "201311282100Z" "201310281900Z" "201309050000Z" '"Add table of hwAclIPPoolHostNameTable" 3"Modified the description of hwAclResourceInfoTrap" 1"Modified the description of hwAclPortPoolPortOp" 1"Modified the description of hwAclNumGroupAclNum" '"Correct wrong translation information" @"Add hwCounterResourceTrapsTable and hwMeterResourceTrapsTable." ," hwAclIpv6NumGroupAclType, add key ucl(4) " V"Add hwAclIpv6BasicSrcWild and hwAclIpv6AdvancedSrcWild and hwAclIpv6AdvancedDestWild" "Add hwAclIpv6UserRuleTable""Change description of hwAclAdvancedPrecedence, hwAclAdvancedTos and hwAclAdvancedDscp in hwAclAdvancedRuleTable.
             Change description of hwAclIpv6AdvancedPrecedence, hwAclIpv6AdvancedTos and hwAclIpv6AdvancedDscp in hwAclIpv6AdvancedRuleTable." ]"Add hwAclIpv6AdvancedTcpFlag and hwAclIpv6AdvancedTcpFlagMask in hwAclIpv6AdvancedRuleTable" E"modify description of hwAclNumGroupTable and hwAclIpv6NumGroupTable" !"Amend some English descriptions" 8"Add hwAclIpv6AdvancedVni in hwAclIpv6AdvancedRuleTable" �"Add hwAclIpv6AdvancedSrcPoolName in hwAclIpv6AdvancedRuleTable
             Add hwAclIPPoolApplyBGPPeer in hwAclIPPoolTable.
             Add hwAclIPPool6Table." 2" hwAclIpv6NumGroupAclType, add key interface(3) " �"Add hwAclBasicVrfAny in hwAclBasicRuleTable
             Add hwAclAdvancedVrfAny in hwAclAdvancedRuleTable.
             Add hwAclIpv6BasicVrfAny in hwAclIpv6BasicRuleTable.
             Add hwAclIpv6AdvancedVrfAny in hwAclIpv6AdvancedRuleTable." �"Add hwAclAdvancedIcmpTypeEnd in hwAclAdvancedRuleTable.
             Add hwAclIpv6AdvancedIcmpTypeEnd in hwAclIpv6AdvancedRuleTable." -"Add hwAclIfDescription in hwAclIfRuleTable." �"Add hwAclAdvancedSrcPortPoolName and hwAclAdvancedDestPortPoolName in hwAclAdvancedRuleTable.
             Add hwAclIPPoolTable, hwAclIPPoolIPTable, hwAclPortPoolTable and hwAclPortPoolPortTable." X"Add hwAclUserDestDomainName in hwAclUserRuleTable, and Add hwAclDomainNameConfigTable." 9"Add hwAclAdvancedTcpFlagMask in hwAclAdvancedRuleTable." k"Add hwAclAdvancedPktLenOp, hwAclAdvancedPktLenBegin and hwAclAdvancedPktLenEnd in hwAclAdvancedRuleTable." x"Chang  hwAclNumGroupAclName in hwAclIpv6NumGroupTable and hwAclIpv6NumGroupAclName in hwAclNumGroupTable  value length" �"Add hwAclAdvancedVni, hwAclAdvancedIgmpType, hwAclAdvancedTtlOp, hwAclAdvancedTtlExpire, hwAclAdvancedTtlExpireEnd in hwAclAdvancedRuleTable." O"Add hwAclUserSrcUserGroupNum, hwAclUserDstUserGroupNum in hwAclUserRuleTable." "Add hwAclResourceTrapsTable." W"Add hwAclAdvancedProtocolNew, hwAclIpv6AdvancedProtocolNew in hwAclAdvancedRuleTable."0"Change the range of hwAclNumGroupAclNum in hwAclNumGroupTable, hwAclBasicAclNum in hwAclBasicRuleTable, 
			hwAclAdvancedAclNum in hwAclAdvancedRuleTable, hwAclIfAclNum in hwAclIfRuleTable, 
			hwAclUserAclNum in hwAclUserRuleTable, hwAclIpv6BasicAclNum in hwAclIpv6BasicRuleTable, 
			hwAclIpv6AdvancedAclNum in hwAclIpv6AdvancedRuleTable, hwAclEthernetFrameAclNum in hwAclEthernetFrameRuleTable, 
			hwAclIpv6NumGroupAclNum ihwAclAdvancedSubitemn hwAclIpv6NumGroupTable, hwAclIpv6IfAclNum in hwAclIpv6IfRuleTable, hwAclMplsAclNum in hwAclMplsRuleTable." S"Add hwAclAdvancedSrcPoolName, hwAclAdvancedDestPoolName in hwAclAdvancedRuleTable" �"Add hwAclIpv6BasicSrcMask in hwAclIpv6BasicRuleTable; Add hwAclIpv6AdvancedSrcMask, hwAclIpv6AdvancedDestMask in hwAclIpv6AdvancedRuleTable"       -- Oct 01, 2021 at 21:12 GMT
           �"This table is used to query information about an ACL rule group, including the ACL configuration order, step length, and description."                       1"An entry containing characters of an acl group "                       m"The index of acl group, identifying an ACL. 
             The object specifies the range of an ACL number."                       �"The object indicates the match order of rules. 
            'config' means matching ACL rules in the configuration sequence,
            'auto' means the ACL rules are matched following the 'Depth-first' principle."                       1"The total number of the rules in the acl group."                      �"The object indicates the step value of number acl.
            Step here refers to the difference between each ID. 
            For instance, given the step is set to 5, 
            the IDs are the multiples of 5 beginning with 5.
            The ACL IDs change along with the step. When the step is 5, 
            the ACL IDs are 5, 10, and 15 and so on. 
            However, when the step is set to 2, the IDs turn to 2, 4, 
            and 6 and so on."                       z"This object indicates the description of a rule group.
            The description length cannot exceed 127 characters."                       �"The value of this object identifies whether to clear up the count of rule groups.
		The value can be:
		cleared(1)
		notUsed(2)
	This field is effective only when you perform the Set operation to this object."                       C"RowStatus, Now support three value: CreateAndGo, Active, Destroy."                       �"The object indicates the name of an acl group,
            The first character must be start with a to z or A to Z, 
            and the length cannot exceed 64 character."                       "The type of ACL group."                       )"Configure the rule for basic acl group."                       $"Each entry is a rule of basic acl."                       W"The index of basic acl group, the index range is (1..99 | 2000..2999 | 42768..76535)."                      �"The objects specifies the number of an ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            by step automatically; otherwise, this rule will not be created."                       �"The object indicates the action of a basic acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       A"The object indicates the source IP-address of a basic acl rule."                       �"The value of this object identifies the wildcard mask of the source IP address.
	The value ranges from 0.0.0.0 to 255.255.255.255."                       �"The value of this object identifies the index of a time range of an ACL rule.
	     The value ranges from 0 to 256. 
	     The value 0 is invalid, indicating that no time range is specified for the rule."                       "The object indicates the type of the packet.     
            0: fragmentSubseq, indicating that the packet is a subsequent fragment
            1: fragment, indicating that the packet is a fragment
            2: nonFragment, indicating that the packet is not a fragment
            3: nonSubseq, indicating that the packet is not a subsequent fragment
            4: fragmentSpeFirst, indicating that the packet is the first fragment
            255: none, invalid value
        This object cannot be modified once a rule is created."                      /"The object indicates whether to log the matched packets. 
            The log contents include sequence number of ACL rule, packets passed
            or discarded, upper layer protocol type    over IP, source/destination 
            address, source/destination port number, and number of packets."                       <"The object indicates whether the rule is valid or invalid."                       E"The object indicates the statistics of matched packets by the rule."                       n"This object indicates an VPN instance.
	     The length of a VPN instance name cannot exceed 31 characters."                       F"RowStatus, Now support three value: CreateAndGo, Active and Destroy."                       �"The object indicates the description of this basic rule.
         The object describes the usage of an ACL with a word or a sentence."                       @"The object indicates whether or not matching any VPN-instance."                       ,"Configure the rule for advanced acl group."                       3"Each entry contains a rule of advanced acl group."                       ]"The index of advanced acl table, the index range is (100..199 | 3000..3999 | 42768..76535)."                      �"The object specifies the number of an advanced ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            by step automatically; otherwise, this rule will not be created."                       �"The object indicates the action of an advanced acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The value of this object identifies the number of the protocol over IP. 
             The value ranges from 0 to 255. The value 0 indicates the IP protocol."                       u"The value of this object identifies the source IP address.
	     The value ranges from 0.0.0.0 to 255.255.255.255."                       �"The value of this object identifies the wildcard mask of the source IP address.
             The value ranges from 0.0.0.0 to 255.255.255.255."                      �"The object indicates the source Port operation symbol of an advanced acl
            rule. It compares the port operators of source address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       3"This object indicates the end source port number."                       5"This object indicates the start source port number."                       l"This object indicates the destination IP address.
	     The value ranges from 0.0.0.0 to 255.255.255.255."                       "This object indicates the mask of the destination IP address.
             The value ranges from 0.0.0.0 to 255.255.255.255."                      �"The object indicates the destination Port operation symbol of an advanced
            acl group. It compares the port operators of destination address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       8"This object indicates the end destination port number."                       :"This object indicates the start destination port number."                       �"The value of this object identifies the precedence sub-field.
	     It is the higher three bits of the ToS field in an IP header.
	     The value ranges from 0 to 7. The invalid value is 255."                       �"The value of this object identifies the ToS sub-field.
	     This field covers four bits after the higher three bits of the ToS field in an IP header.
	     The value ranges from 0 to 15. The invalid value is 255."                       �"The value of this object identifies the higher six bits of the ToS field in an IP header.
	     The value ranges from 0 to 63. The invalid value is 255."                       3"The object indicates whether or not establishing."                       �"The object indicates the time range of an advanced acl rule. 
            When the current time is in the time range, the rule is valid.
            Zero value declares that the acl rule has no time range. The 
            invalid value is 0."                       �"The object indicates the type of ICMP packet. 
            It filters ICMP packets according to the ICMP message type.
            The invalid value is 65535."                       �"The object indicates the code of ICMP packet.
            It filters ICMP packets according to the message code.
            The invalid value is 65535."                      "The object indicates the type of the packet.     
            0: fragmentSubseq, indicating that the packet is a subsequent fragment
         1: fragment, indicating that the packet is a fragment
         2: nonFragment, indicating that the packet is not a fragment
         3: nonSubseq, indicating that the packet is not a subsequent fragment
         4: fragmentSpeFirst, indicating that the packet is the first fragment
         255: none, invalid value
         This object cannot be modified once a rule is created."                      :"The object indicates whether to log the matched packets. The log 
            contents include sequence number of ACL rule, 
            packets passed or discarded, upper layer protocol type over IP, 
            source/destination address, source/destination port number, 
            and number of packets"                       <"The object indicates whether the rule is valid or invalid."                       E"The object indicates the statistics of matched packets by the rule."                       z"The object indicates the VRF name of this rule, 
            It specifies the VPN-instance to which the packet belongs."                       C"RowStatus, Now support three state: CreateAndGo, Active, Destroy."                       ^"The object indicates the code of TCP Sync flag(0~63),
             The invalid value is -1."                       �"The object indicates the description of this advanced rule.
         The object describes the usage of an ACL with a word or a sentence."                       ,"The object indicates the source pool name."                       1"The object indicates the destination pool name."                       �"The object indicates the protocol type of the rule.
            It specifies the protocol type over IP. The number of IP protocol is 65535."                       M"The object indicates the ID of VXLAN,
             The invalid value is 0."                       R"The object indicates the type of igmp,
             The invalid value is 65535."                      O"The object indicates the ttl operation symbol of an advanced acl
            rule.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       P"The object indicates the begin ttl value.
            The invalid value is 0."                       N"The object indicates the end ttl value.
            The invalid value is 0."                      Y"The object indicates the packet length operation symbol of an advanced acl
            rule.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       5"The object indicates the begin packet length value."                       3"The object indicates the end packet length value."                       Q"The object indicates the mask of tcp-flag.
            The invalid value is 0."                       1"The object indicates the source port pool name."                       6"The object indicates the destination port pool name."                       �"The value of this object identifies the ICMP message type.
	    The value ranges from 0 to 255. The value 65535 is invalid.
	    This object is used together with hwAclAdvancedIcmpType to indicate the value range of the ICMP message type."                       @"The object indicates whether or not matching any VPN-instance."                       3"Configure the rule for interface-based acl group."                       :"Each entry contains a rule of interface-based acl group."                       Y"The index of interface-based acl group, the index range is (1000..1999 | 42768..76535)."                      �"The object specifies the number of an ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            by step automatically; otherwise, this rule will not be created."                       �"The object indicates the action of an interface-based acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The object indicates the index of an interface. 
            It specifies the interface information of the packets.The invalid
            interface index is 0."                       ="The object indicates whether or not matching any interface."                      5"The value of this object identifies the index of the time 
	    range during which an ACL rule can be applied. When the current 
	    time is in the time range, the rule is valid. The value 0 is 
	    invalid, indicating that no time range is specified for the rule.
	    The value ranges from 0 to 256."                      ;"The object indicates whether to log the matched packets. 
            The log contents include sequence number of ACL rule, 
            packets passed or discarded, upper layer protocol type over IP, 
            source/destination address, source/destination port number, 
            and number of packets."                       <"The object indicates whether the rule is valid or invalid."                       E"The object indicates the statistics of matched packets by the rule."                       ?"RowStatus,Now support three state:CreateAndGo,Active,Destroy."                       �"The object indicates the description of this if rule.
         The object describes the usage of an ACL with a word or a sentence."                       ("Configure the rule for user acl group."                       /"Each entry contains a rule of user acl group."                       ?"The index of user acl table, the index range is (6000..9999)."                      �"The object specifies the number of an User ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle"                       �"The object indicates the action of an User acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The object indicates the protocol type of the rule.
            It specifies the protocol type over IP. The number of IP protocol is 0."                       A"The object indicates the source IP-address of an User acl rule."                       F"The object indicates the source IP-address wild of an User acl rule."                      �"The object indicates the source Port operation symbol of an User acl
            rule. It compares the port operators of source address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       �"The object indicates the fourth layer sourec port 1.
            It specifies the source port information of UDP or TCP packets."                       5"The object indicates the fourth layer source port2."                       F"The object indicates the destination IP-address of an User acl rule."                       K"The object indicates the destination IP-address wild of an User acl rule."                      �"The object indicates the destination Port operation symbol of an User
            acl group. It compares the port operators of destination address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       :"The object indicates the fourth layer destination port1."                       :"The object indicates the fourth layer destination port2."                       �"The object indicates the value of IP-packet's precedence, 
            It filters packets according to precedence field.The invalid
            value is 255."                       �"The object indicates the value of IP-packet's TOS,
            It filters packets according to type of service.The invalid
            value is 255."                       Q"The object indicates the value of frame.The invalid 
            value is 255."                       3"The object indicates whether or not establishing."                       �"The object indicates the time range of an User acl rule. 
            When the current time is in the time range, the rule is valid.
            Zero value declares that the acl rule has no time range. The 
            invalid value is 0."                       �"The object indicates the type of ICMP packet. 
            It filters ICMP packets according to the ICMP message type.
            The invalid value is 65535."                       �"The object indicates the code of ICMP packet.
            It filters ICMP packets according to the message code.
            The invalid value is 65535."                       �"The object indicates whether or not matching fragmented packet,
            It specifies that this rule is only valid for 
            the non-first fragment packets."                      :"The object indicates whether to log the matched packets. The log 
            contents include sequence number of ACL rule, 
            packets passed or discarded, upper layer protocol type over IP, 
            source/destination address, source/destination port number, 
            and number of packets"                       <"The object indicates whether the rule is valid or invalid."                       E"The object indicates the statistics of matched packets by the rule."                       z"The object indicates the VRF name of this rule, 
            It specifies the VPN-instance to which the packet belongs."                       �"The object indicates the source user group name of this rule.
             if modetype source is user, null sting means any user"                       �"The object indicates the destination user group name of this rule.
             if modetype destination is user, null sting means any user"                      y"The object indicates ACL's mode type,
            Now support four state 
            0 Any        match rule from any user group or any ip subnet,
            1 NetAny     match rule from any ip subnet,
            2 UserAny    match rule from any user group,
            3 Net        match rule from an ip subnet,
            4 User       match rule from a user group"                       "The object indicates ACL's mode type,
            Now support four state 
            0 Any        match rule from any user group or any ip subnet or any doamin name,
            1 NetAny     match rule from any ip subnet,
            2 UserAny    match rule from any user group,
            3 Net        match rule from an ip subnet,
            4 User       match rule from a user group,
            5 domain     match rule from a domain name,
            6 domainAny  match rule from any doamin name"                       C"RowStatus, Now support three state: CreateAndGo, Active, Destroy."                       ^"The object indicates the code of TCP Sync flag(0~63),
             The invalid value is -1."                       �"The object indicates the source user group num of this rule.
             if modetype source is user, null sting means any user"                       �"The object indicates the destination user group name of this rule.
             if modetype destination is user, null sting means any user"                       �"The object indicates the destination domain name of this rule.
               if modetype destination is domain, null sting means any domain."                       �"The object indicates whether acl compiler is enabled. when acl compiler
            is enabled, and ACL accelerate function is enabled, then matching packets
            by rule is efficient."                       ="The ACL compiler table extending the Acl-number-group table"                       7"The entry of Acl-number-group compiler extended table"                      "The object indicates the status of Acl-number-group compiler.
            'notCompile' means acl accelerate function is disabled,
            'compiled' means acl accelerate function is enabled,
            'changeAfterCompile' means acl is changed after compiled."                       ."Configure the rule for ipv6 basic acl group."                       )"Each entry is a rule of ipv6 basic acl."                       T"The index of ipv6 basic acl group, the index range is (2000..2999 | 42768..75535)."                      �"The objects specifies the number of an ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            automatically; otherwise, this rule will not be created."                       �"The object indicates the action of a ipv6 basic acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       H"The object indicates the source IPv6-address of a ipv6 basic acl rule."                       x"The value of this object identifies the mask length of the source IPv6 address. 
	    The value ranges from 0 to 128."                       �"The value of this object identifies the index of the time range during which an 
	    ACL6 rule can be applied. The value ranges from 0 to 256. The value 0 is invalid, 
	    indicating that no time range is specified for the rule."                       �"The object indicates the type of the packet.     
           1: fragment, indicating that the packet is a fragment
           255: none, invalid value
        This object cannot be modified once a rule is created."                      ,"The object indicates whether to log the matched packets. 
            The log contents include sequence number of ACL rule, packets passed
            or discarded, upper layer protocol type over IP, source/destination 
            address, source/destination port number, and number of packets."                       <"The object indicates whether the rule is valid or invalid."                       k"This object indicates the number of matched packets by a rule. A maximum 
	    of 64 bits are supported."                       f"This object indicates a VPN instance. The length of a VPN instance name cannot exceed 31 characters."                       F"RowStatus, Now support three value: CreateAndGo, Active and Destroy."                       �"The object indicates the description of this IPv6 basic rule.
         The object describes the usage of an IPv6 ACL with a word or a sentence."                       c"The object indicates the source IPv6-address mask of a ipv6 basic acl rule. Its mode is positive."                       @"The object indicates whether or not matching any VPN-instance."                       D"The object indicates the wildcard mask of the source IPv6 address."                       1"Configure the rule for ipv6 advanced acl group."                       8"Each entry contains a rule of ipv6 advanced acl group."                       W"The index of ipv6 advanced acl table, the index range is (3000..3999 | 42768..75535)."                      �"The object specifies the number of an ipv6 advanced ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            automatically; otherwise, this rule will not be created."                       �"The object indicates the action of an ipv6 advanced acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The value of this object identifies the number of the protocol over IPv6. 
	    The value ranges from 0 to 255. The value 0 indicates the IPv6 protocol."                       L"The object indicates the source IPv6-address of an ipv6 advanced acl rule."                       x"The value of this object identifies the mask length of the source IPv6 address. 
	    The value ranges from 0 to 128."                      �"The object indicates the source Port operation symbol of an ipv6 advanced acl
            rule. It compares the port operators of source address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       3"This object indicates the end source port number."                       5"This object indicates the start source port number."                       Q"The object indicates the destination IPv6-address of an ipv6 advanced acl rule."                       v"The value of this object identifies the mask length of the destination IPv6 address. The value ranges from 0 to 128."                      �"The object indicates the destination Port operation symbol of an ipv6 advanced
            acl group. It compares the port operators of destination address.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'neq' means not equal to,
            'range' means between,
            'invalid' means this operation of the rule is invalid."                       <"This object indicates the largest destination port number."                       ="This object indicates the smallest destination port number."                       �"The value of this object identifies the precedence sub-field.
	    It is the higher three bits of the ToS field in an IPv6 header.
	    The value ranges from 0 to 7. The invalid value is 255."                       �"The value of this object identifies the ToS sub-field.
	    This field covers four bits after the higher three bits of the ToS field in an IPv6 header.
	    The value ranges from 0 to 15. The invalid value is 255."                       �"The value of this object identifies the higher seven bits of the ToS field in an IPv6 header.
	    The value ranges from 0 to 63. The invalid value is 255."                       3"The object indicates whether or not establishing."                       �"The value of this object identifies the index of the time range during which an ACL6 rule can be applied. 
	    The value ranges from 0 to 256.
	    The value 0 indicates that no time range is specified for the rule."                       �"The value of this object identifies the ICMPv6 message type.
	    The value ranges from 0 to 255. The value 65535 is invalid."                       �"The value of this object identifies the code of an ICMPv6 message. 
	    The value ranges from 0 to 255. The value 65535 is invalid."                       �"The object indicates the type of the packet.     
         1: fragment, indicating that the packet is a fragment
         255: none, invalid value
         This object cannot be modified once a rule is created."                      :"The object indicates whether to log the matched packets. The log 
            contents include sequence number of ACL rule, 
            packets passed or discarded, upper layer protocol type over IP, 
            source/destination address, source/destination port number, 
            and number of packets"                       <"The object indicates whether the rule is valid or invalid."                       d"This object indicates the number of packets matched by a rule. A maximum of 64 bits are supported."                       m"This object indicates a VPN instance. 
	    The length of a VPN instance name cannot exceed 31 characters."                       C"RowStatus, Now support three state: CreateAndGo, Active, Destroy."                       �"The object indicates the description of this IPv6 advanced rule.
         The object describes the usage of an IPv6 ACL with a word or a sentence."                       g"The object indicates the source IPv6-address mask of an ipv6 advanced acl rule. Its mode is positive."                       l"The object indicates the destination IPv6-address mask of an ipv6 advanced acl rule. Its mode is positive."                       �"The object indicates the protocol type of the rule.
            It specifies the protocol type over IP. The number of IPv6 protocol is 65535."                       �"The value of this object identifies the ICMPv6 message type.
	    The value ranges from 0 to 255. The value 65535 is invalid.
	    This object is used together with hwAclIpv6AdvancedIcmpType to indicate the value range of the ICMPv6 type."                       @"The object indicates whether or not matching any VPN-instance."                       1"The object indicates the source Ipv6 pool name."                       M"The object indicates the ID of VXLAN,
             The invalid value is 0."                       ^"The object indicates the code of TCP Sync flag(0~63),
             The invalid value is -1."                       Q"The object indicates the mask of tcp-flag.
            The invalid value is 0."                       D"The object indicates the wildcard mask of the source IPv6 address."                       I"The object indicates the wildcard mask of the destination IPv6 address."                       8"Configure the rule for ethernet-frame-based acl group."                       ?"Each entry contains a rule of ethernet-frame-based acl group."                       ^"The index of ethernet-frame-based acl group, the index range is (4000..4999 | 42768..76535)."                      �"The object specifies the number of an ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            by step automatically; otherwise, this rule will not be created."                       �"The object indicates the action of an ethernet-frame-based acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       v"The value of this object identifies the protocol type of an Ethernet frame. 
	    The value ranges from 0 to 65535."                       �"The value of this object identifies the mask of the protocol type of an Ethernet frame. 
	    The value ranges from 0 to 65535."                       6"The object indicates the source mac address of rule."                       3"The object indicates the source mac mask of rule."                       ;"The object indicates the destination mac address of rule."                       8"The object indicates the destination mac mask of rule."                       �"The object indicates the time range of a ethernet frame
            acl rule. When the current time is in time range, the rule
            is valid. Zero value declares that the acl rule has no 
            time range. The invalid value is 0."                      "The object indicates whether to log the matched packets. 
            The log contents include sequence number of ACL rule, 
            packets passed or discarded, source/destination mac addr, 
            protocol of ethernet frame, and number of packets."                       <"The object indicates whether the rule is valid or invalid."                       d"This object indicates the number of matched packets by a rule. A maximum of 64 bits are supported."                       ?"RowStatus,Now support three state:CreateAndGo,Active,Destroy."                       6"The object indicates the encapsulation type of rule."                       b"The object indicates two tags of rule. False value do not 
            care the number of tags."                       R"The object indicates the vlan ID of rule. The invalid
            vlan ID is 0."                       0"The object indicates the vlan ID mask of rule."                       U"The object indicates the ce-vlan ID of rule. The invalid
            vlan ID is 0."                       3"The object indicates the ce-vlan ID mask of rule."                       0"The object indicates the 8021p value of S-tag."                       0"The object indicates the 8021p value of C-tag."                       �"The object indicates the description of this ethernetframe rule.
                 The object describes the usage of an ACL with a word or a sentence."                       "Configure the applied ACL."                       $"Each entry contains a applied ACL."                       H"The actions taken when packets conforming or exceeding the configured."                       "The scope that ACL apply on."                       �"When the scope is global, this field is invalid;
                When the scope is vlan, this field is vlan ID;
                When the scope is interface, this field is interface index."                       "The direction acl apply on."                       �"The index of ACL group.
                Basic ACL in range 2000~2999;
                Advance ACL in range 3000~3999;
                Link ACL in range 4000~4999;"                       1"The object specifies the number of an ACL rule."                       L"The index of ACL group. 
                65535 means this field is valid."                       1"The object specifies the number of an ACL rule."                       k"The object specifies the mode of statistics. 
            When action is statistic, this field is valid."                       �"The object indicates the statistics of matched packets by the policy.
            When action is statistic or limit, this field is valid."                       )"Committed information rate. Unit: kbps."                       M"Peak information rate. Unit: kbps.
                0 is the default value."                       L"Committed burst size. Unit: byte.
                0 is the default value."                       G"Peak burst size. Unit: byte.
                0 is the default value."                       "Green action."                       �"The value is to remark When green action is remarking.
                For remarking DSCP, the range is 0~63;
                For remarking 8021p, the range is 0~7."                       "Yellow action."                       �"The value is to remark When yellow action is remarking.
                For remarking DSCP, the range is 0~63;
                For remarking 8021p, the range is 0~7."                       "Red action."                       �"The value is to remark When red action is remarking.
                For remarking DSCP, the range is 0~63;
                For remarking 8021p, the range is 0~7."                       !"The mirror observe port number."                       R"The object specifies the RSPAN vlan. 
            0 means mirror to local port."                        "The redirect output interface."                       #"The redirect IP next hop address."                       %"The redirect IPv6 next hop address."                       "The remarked vlan ID."                       "The remarked ce-vlan ID."                       "The remarked 8021p value."                       "The remarked DSCP value."                       #"The remarked IP precedence value."                       &"The remarked local precedence value."                       "The remarked MAC address."                       +"The object indicates whether is IPv6 ACL."                       ?"RowStatus,Now support three state:CreateAndGo,Active,Destroy."                       �"This table is used to query information about an ACL rule group, including the ACL configuration order, step length, and description."                       6"An entry containing characters of an IPv6 ACL group."                      
"The value of this object identifies a table index, representing the number of an IPv6 ACL rule group. 
		The value range is as follows:
		Interface-based ACL6: 1000 to 1999
		Basic ACL6: 2000 to 2999
		Advanced ACL6: 3000 to 3999 
		Named ACL6: 42768 to 75535"                       �"The object indicates the match order of rules. 
                'config' means matching ACL rules in the configuration sequence,
                'auto' means the ACL6 rules are matched following the 'Depth-first' principle."                       2"The total number of the rules in the ACL6 group."                       �"This object indicates whether to clear the statistics of an ACL6 rule group.
		cleared(1): clear
		notUsed(2): not clear
		This object is valid only when the Set operation is performed for this object."                       �"The object indicates the name of an acl6 group,
            The first character must be start with a to z or A to Z, 
            and the length cannot exceed 64 character."                       z"This object indicates the description of an ACL6 rule group. 
	    The description length cannot exceed 127 characters."                       "The type of IPv6 ACL group."                       C"RowStatus, Now support three value: CreateAndGo, Active, Destroy."                      �"The object indicates the step value of number IPv6 ACL.
            Step here refers to the difference between each ID. 
            For instance, given the step is set to 5, 
            the IDs are the multiples of 5 beginning with 5.
            The IPv6 ACL IDs change along with the step. When the step is 5, 
            the IPv6 ACL IDs are 5, 10, and 15 and so on. 
            However, when the step is set to 2, the IDs turn to 2, 4, 
            and 6 and so on."                       4"Configure the rule for interface-based acl6 group."                       ;"Each entry contains a rule of interface-based acl6 group."                       Z"The index of interface-based acl6 group, the index range is (1000..1999 | 42768..75535)."                      �"The object specifies the number of an ACL6 rule.
            If the number specified has been assigned to an ACL6 rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL6. It will be placed at the end of the 
            ACL6 when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL6 rule must be given 0, but it will be assigned
            automatically; otherwise, this rule will not be created."                       �"The object indicates the action of an interface-based acl6 rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The object indicates the index of an interface. 
            It specifies the interface information of the packets. The invalid
            interface index is 0."                       ="The object indicates whether or not matching any interface."                      '"The value of this object identifies the index of the time range during which an ACL rule can be applied. 
	    When the current time is in the time range, the rule is valid. The value 0 is invalid, 
	    indicating that no time range is specified for the rule.The value ranges from 0 to 256."                      <"The object indicates whether to log the matched packets. 
            The log contents include sequence number of ACL6 rule, 
            packets passed or discarded, upper layer protocol type over IP, 
            source/destination address, source/destination port number, 
            and number of packets."                       <"The object indicates whether the rule is valid or invalid."                       G"The object indicates the statistics of matched packets by basic rule."                       ?"RowStatus,Now support three state:CreateAndGo,Active,Destroy."                       ("Configure the rule for mpls acl group."                       #"Each entry is a rule of mpls acl."                       P"The index of mpls acl group, the index range is (10000..10999 | 42768..76535)."                      �"The objects specifies the number of an ACL rule.
            If the number specified has been assigned to an ACL rule, 
            the new rule will overwrite the old one, 
            which is equal to editing the old rule. 
            If the number is not assigned, the system will define 
            a rule with the number and insert it to the place 
            corresponding to its number. If no number is specified, 
            the system will define a rule, assign a number to it and 
            add it into the ACL. It will be placed at the end of the 
            ACL when configuration sequence is adopted; otherwise, 
            it will be placed based on the 'Depth-first' principle.
            When ACL rules are following the 'Depth-first' principle,
            the number of an ACL rule must be given 0, but it will be assigned
            by step automatically; otherwise, this rule will not be created."                       �"The object indicates the action of a basic acl rule.
            'deny' means discarding the packets that meet the condition,
            'permit' means permitting the packets that meet the condition."                       �"The value of this object identifies the EXP value in the first label of an MPLS packet. 
	    The value ranges from 0 to 7. The default value is 255."                       �"The value of this object identifies the EXP value in the second label of an MPLS packet. 
	    The value ranges from 0 to 7. The default value is 255."                       �"The value of this object identifies the EXP value in the third label of an MPLS packet. 
	    The value ranges from 0 to 7. The default value is 255."                       �"The value of this object identifies the EXP value in the fourth label of an MPLS packet. 
	    The value ranges from 0 to 7. The default value is 255."                       �"The value of this object identifies the Label value in the first label of an MPLS packet.
	    The value ranges from 0 to 1048575. The default value is -1."                       �"The value of this object identifies the Label value in the second label of an MPLS packet. 
	    The value ranges from 0 to 1048575. The default value is -1."                       �"The value of this object identifies the Label value in the third label of an MPLS packet. 
	    The value ranges from 0 to 1048575. The default value is -1."                       �"The value of this object identifies the Label value in the fourth label of an MPLS packet. 
	    The value ranges from 0 to 1048575. The default value is -1."                      J"The object indicates the ttl operation symbol of a mpls
            acl rule. It compares the operators of ttl value.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'range' means between,
            'invalid' means this operation of the ttl is invalid."                       5"The object indicates the begin value of a mpls ttl."                       3"The object indicates the end value of a mpls ttl."                      J"The object indicates the ttl operation symbol of a mpls
            acl rule. It compares the operators of ttl value.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'range' means between,
            'invalid' means this operation of the ttl is invalid."                       5"The object indicates the begin value of a mpls ttl."                       3"The object indicates the end value of a mpls ttl."                      J"The object indicates the ttl operation symbol of a mpls
            acl rule. It compares the operators of ttl value.
            'lt' means less than,
            'eq' means equal to,
            'gt' means greater than,
            'range' means between,
            'invalid' means this operation of the ttl is invalid."                       5"The object indicates the begin value of a mpls ttl."                       3"The object indicates the end value of a mpls ttl."                       F"RowStatus, Now support three value: CreateAndGo, Active and Destroy."                       E"The object indicates the statistics of matched packets by the rule."                       "Configure the domain name."                       "Each entry is a domain name."                       <"The index of DomianName table, the index range is (0..31)."                       "The domian name."                       >"Row status,Two actions are used: createAndGo(4), destroy(6)."                       "Configure the IP pool name."                       "Each entry is a IP pool name."                       !"The index of ACL IP pool table."                       "The IP pool name."                       "Row status."                       <"The object indicates whether or not BGP peers are applied."                       &"Configure the IP address of IP pool."                       ("Each entry is a IP address of IP pool."                       c"This object indicates the level 1 index, that is, the index of an IP address pool used by an ACL."                       v"This object indicates the level 2 index, that is, the index of an IPv4 address in an IP address pool used by an ACL."                       &"The object indicates the IP-address."                       +"The object indicates the IP-address wild."                       "Row status."                       "Configure the port pool name."                       !"Each entry is a port pool name."                       #"The index of ACL port pool table."                       "The Port pool name."                       "Row status."                       ("Configure the port range of port pool."                       *"Each entry is a port range of port pool."                       R"This object indicates the level 1 index, that is, the index of an ACL port pool."                       d"This object indicates the level 2 index, that is, the index of a port number in the ACL port pool."                      �"Operator that compares port numbers in an ACL port pool. The options are as follows:
             lt (matching packets whose port number is smaller than the specified port number)
             eq (matching packets with the specified port number)
             gt (matching packets whose port number is greater than the specified port number)
             neq (matching packets whose port number is different from the specified port number)
             invalid (invalid rule matching operation)
             range (matching packets with a specified port number in a certain range). Only range requires two port numbers as the operand. Other values require only one port number as the operand."                       -"The object indicates the begin port number."                       +"The object indicates the end port number."                       "Row status."                       "Configure the IPv6 pool name."                       !"Each entry is a IPv6 pool name."                       #"The index of ACL IPv6 pool table."                       "The IPv6 pool name."                       A"The object indicates whether or not BGP IPv6 peers are applied."                       "Row status."                       "Description."                       "Description."                       S"The index of ipv6 User acl table, the index range is (3000..3999 | 42768..75535)."                       ="The object specifies the number of an ipv6 User ACL rule.
"                       ="The object indicates the action of an ipv6 User acl rule.
"                       �"The object indicates the protocol type of the rule.

				            It specifies the protocol type over IP. The number of IPv6 protocol is 0."                       H"The object indicates the source IPv6-address of an ipv6 User acl rule."                       V"The object indicates the source IPv6-address prefix length of an ipv6 User acl rule."                       M"The object indicates the source Port operation symbol of an ipv6 User acl
"                       5"The object indicates the fourth layer source port2."                       F"The object indicates the source user group of an ipv6 User acl rule."                       O"The object indicates the source passthrough domain  of an ipv6 User acl rule."                       Q"The object indicates the source passthrough domain Id of an ipv6 User acl rule."                       O"The object indicates the source passthrough domain  of an ipv6 User acl rule."                       M"The object indicates the destination IPv6-address of an ipv6 User acl rule."                       ["The object indicates the destination IPv6-address prefix length of an ipv6 User acl rule."                       N"The object indicates the destination Port operation symbol of an ipv6 User
"                       :"The object indicates the fourth layer destination port1."                       :"The object indicates the fourth layer destination port2."                       K"The object indicates the destination user group of an ipv6 User acl rule."                       S"The object indicates the destination passthrough domain of an ipv6 User acl rule."                       S"The object indicates the destination passthrough domain of an ipv6 User acl rule."                       @"The object indicates the value of IPv6-packet's precedence, 
"                       8"The object indicates the value of IPv6-packet's TOS,
"                       8"The object indicates the value of frame.The invalid 
"                       3"The object indicates whether or not establishing."                       B"The object indicates the time range of an ipv6 User acl rule. 
"                       4"The object indicates the type of ICMPv6 packet. 
"                       3"The object indicates the code of ICMPv6 packet.
"                       �"The object indicates the type of the packet.     

				         1: fragment, indicating that the packet is a fragment

				         255: none, invalid value

				         This object cannot be modified once a rule is created.
"                      R"The object indicates whether to log the matched packets. The log 

				            contents include sequence number of ACL rule, 

				            packets passed or discarded, upper layer protocol type over IP, 

				            source/destination address, source/destination port number, 

				            and number of packets"                       <"The object indicates whether the rule is valid or invalid."                       E"The object indicates the statistics of matched packets by the rule."                       �"The object indicates the VRF name of this rule, 

				            It specifies the VPN-instance to which the packet belongs."                       @"The object indicates the description of this IPv6 User rule.
"                       C"RowStatus, Now support three state: CreateAndGo, Active, Destroy."                       &"The object indicates ACL's mode type"                       &"The object indicates ACL's mode type"                       %"Configure the host name of IP pool."                       '"Each entry is a host name of IP pool."                       c"This object indicates the level 1 index, that is, the index of an IP address pool used by an ACL."                       s"This object indicates the level 2 index, that is, the index of an host name in an IP address pool used by an ACL."                       %"The object indicates the host name."                       "Row status."                                           "The infomation of slot."                       )"The stage where trap infomation exists."                       "The usage of rule resource."                           "Acl resource lack clear trap"                 "Acl resource lack trap"                 "Acl resource full clear trap"                 "Acl resource full trap"                     #"Group for all acl resource traps."                         "The infomation of slot."                       )"The stage where trap infomation exists."                        "The usage of counter resource."                           &"Acl counter resource lack clear trap"                  "Acl counter resource lack trap"                 &"Acl counter resource full clear trap"                  "Acl counter resource full trap"                     +"Group for all acl counter resource traps."                         "The infomation of slot."                       )"The stage where trap infomation exists."                       "The usage of meter resource."                           $"Acl meter resource lack clear trap"                 "Acl meter resource lack trap"                 $"Acl meter resource full clear trap"                 "Acl meter resource full trap"                     )"Group for all acl meter resource traps."                         *"The device acl resources were overloaded"                 '"The device acl resources were resumed"                 *"The device acl resources were not enough"                     !"The total num of rule resource."                        "The used num of rule resource."                       "The usage of rule resource."                       ("The empty infomation of rule resource."                               Y"The compliance statement for entities which 
            implement the Huawei acl MIB."   I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required." I"The value of creatAndWaite, notInservice and notReady are not required."                 >"A collection of objects providing mandatory acl information."                