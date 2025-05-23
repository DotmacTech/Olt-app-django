�--  =================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: Huawei Attack defence MIB, this MIB is for firewall only.
-- Reference:
-- Version:     V1.20
-- History:
--  
--  V1.20 2005-05-30 Wei Rixi(22510) added mplsVpnVrfName as table index,
--              changed the region of ApplyZoneID(hwNatEudmZoneApplyZoneID1
--              and hwNatEudmZoneApplyZoneID2) from 1~16 to 0~128.
--              Added fields to HwAspfEudmAppEnableEntry and hwAspfEudmAppEnableGroup.
--  V1.10 2004-06-30 Xin Jianfeng(37631) altered the region of 
--              hwAtkZoneSynFloodSynSpeed, hwAtkZoneUdpFloodSpeed & 
--              hwAtkZoneSynFloodHalfAge to 0~1000000, 
--              hwAtkZoneSynFloodHalfAge to 0~65535
--  V1.00 2003-03-18 Yang Yinzhu(28193)  initial version
-- =================================================================
                         �"
            The HUAWEI-ATCKDF_EUDM-MIB contains objects to
            manage the ATCKDF(Attack Defence)
            configuration for firewall.
            "5"
            R&D BeiJing, Huawei Technologies co.,Ltd.
            Huawei Bld.,NO.3 Xinxi Rd.,
            Shang-Di Information Industry Base,
            Hai-Dian District Beijing P.R. China
            Zip:100085
            Http://www.huawei.com
            E-mail:support@huawei.com
            "        -- March 19, 2003 at 09:00 GMT
           �"
            SYN Flood configuration table for a security zone. 
            which consists of a sequence of hwAtckDfSynFloodZoneEntry items.
            "                       �"
            An entry in the hwAtckDfSynFloodZoneTable containing the parameters
            of SYN flood defence for all hosts behind a security zone.
            this table is for firewall only.
            "                       3"The internal ID of security zone to be protected."                       �"
            The threshold value of SYN packets speed.
            when the speed of SYN packets to one host in this zone readch this value,
            the firewall will startup TCP proxy.
            "                       @"This is the maximum half connection for each host in the zone."                       !"The age of TCP half connection."                       �"
            The switch of TCP proxy, this switch decides the action of proxy.
            The switch has three status: auto, on, off.
            "                       _"
            The row status variable, current support CreateAndGo and Destroy.
            "                       �"
            UDP Flood configuration table for a security zone. 
            which consists of a sequence of hwAtckDfUdpFloodZoneEntry items.
            "                       �"
            An entry in the hwAtckDfUdpFloodZoneTable containing the parameters
            of UDP flood defence for all hosts behind a security zone.
            this table is for firewall only.
            "                       *"The ID of security zone to be protected."                       �"
            The threshold value of UDP packets speed.
            when the speed of UDP packets to one host in this zone reach this value,
            the firewall will drops the subsequence UDP packets to this host.
            "                       _"
            The row status variable, current support CreateAndGo and Destroy.
            "                       �"
            ICMP Flood configuration table for a security zone. 
            which consists of a sequence of hwAtckDfIcmpFloodZoneEntry items.
            "                       �"
            An entry in the hwAtckDfIcmpFloodZoneTable containing the parameters
            of ICMP flood defence for all hosts behind a security zone.
            this table is for firewall only.
            "                       *"The ID of security zone to be protected."                       �"
            The threshold value of ICMP packets speed.
            when the speed of ICMP packets to one host in this zone reach this value,
            the firewall will drops the subsequence ICMP packets to this host.
            "                       _"
            The row status variable, current support CreateAndGo and Destroy.
            "                                   :"
            The MIB objects need for SYN flood defence"                 H"
            The MIB objects need for UDP flood defence
            "                 I"
            The MIB objects need for ICMP flood defence
            "                                