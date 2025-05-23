f-- ==================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI L3 Vlan Management MIB
-- Reference:
-- Version:     V1.0
-- History:
--              Created by MaYe, 2003.08.11
-- ==================================================================
                    "The HUAWEI-L3VLAN-MIB contains objects to
             manage level 3 vlan.
             Through the MIB,you can get the detail information
             of each vlan,such as VLANID,encapsulated type,the 
             statistics of the received and sent packets and so on."B"R&D BeiJing, Huawei Technologies co.,Ltd.
            Huawei Bld.,NO.3 Xinxi Rd., 
            Shang-Di Information Industry Base,
            Hai-Dian District Beijing P.R. China
            Zip:100085 
            Http://www.huawei.com                                       
            E-mail:support@huawei.com"                   a"This table contains the information of vlans 
             encapsulated by the sub-interfaces."                       9"Provides the information of a sub-interface vlan entry."                       7"Interface index(es) of port(s) present on the device."                       U"This object specifies the vlan id encapsulated by 
             the sub-interface."                       W"This object specifies the vlan type encapsulated 
             by the sub-interface."                       R"This object specifies the status of the sub-interface 
             vlan table."                       w"Per vid router statistics table includes the
                 number of packets that each vlan is received and sent."                       '"Entry of vLANMibRoutertVlanCountTable"                       ="Interface index(es) of trunk port(s) present on the device."                       "The vlan id."                       +"The number of packets transmitted to vlan"                        "Number of packets sent by vlan"                      "Setting the object to clear(1) will clear the counters of a row 
            of the hwVLANMibRoutertVlanCountTable. When a clear action had been
            finished, or there is no clear action , the value of the object
            would be unavailable(0)."                                   W"The compliance statement for systems supporting 
             the HUAWEI-L3VLAN-MIB."                   $"Standard sub-interface vlan group."                            