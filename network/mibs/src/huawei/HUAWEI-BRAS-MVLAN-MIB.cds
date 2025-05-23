>-- =================================================================
-- Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved.
--
-- Description:HUAWEI-BRAS-MVLAN-MIB DEFINITIONS
-- Reference:
-- Version: V1.0
-- History:
--     
-- =================================================================
     M"The HUAWEI-BRAS-MVLAN-MIB contains objects to
                manage BRAS."("R&D NanJing, Huawei Technologies co.,Ltd.
                Huihong Bld.,NO.91 Baixia Rd., 
                Bai-Xia District Nanjing P.R. China
                Zip:210001 
                Http://www.huawei.com                                       
                E-mail:support@huawei.com."                   1"A table of setting multicast program VlanTable."                       #"An entry of hwMulticastVlanEntry."                      �"A value used to index per-VLAN tables: values of 0 and
                    4095 are not permitted.  If the value is between 1 and
                    4094 inclusive, it represents an IEEE 802.1Q VLAN-ID with
                    global scope within a given bridged domain (see VlanId
                    textual convention).  If the value is greater than 4095,
                    then it represents a VLAN with scope local to the
                    particular agent, i.e., one without a global VLAN-ID
                    assigned to it.  Such VLANs are outside the scope of
                    IEEE 802.1Q, but it is convenient to be able to manage them
                    in the same way using this MIB."                       �"The hwMulticastInnerVlan that uniquely identifies a VLAN.  This
                     is the 12-bit VLAN-ID used in the VLAN Tag header.
                     The range is defined by the REFERENCEd specification." M"IEEE Std 802.1Q 2003 Edition, Virtual Bridged
        Local Area Networks."                     �"The hwMulticastOuterVlan that uniquely identifies a VLAN.  This
                     is the 12-bit VLAN-ID used in the VLAN Tag header.
                     The range is defined by the REFERENCEd specification." M"IEEE Std 802.1Q 2003 Edition, Virtual Bridged
        Local Area Networks."                     ;"0 : set multicast-vlan.
        1 : undo multicast-vlan."                               `"The compliance statement for systems supporting 
                the HUAWEI-DATACOMM-OID-MIB."                   "The hwMVLAN group."                            