�-- =================================================================
-- Copyright (C) 2006 by HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: This MIB defines all the objects that containing PWE3 tunnel information.
-- Reference: rfc4001
-- Version: V1.00
-- History:
--         V1.0 Rengaofeng, 2008-12-11, publish
-- =================================================================
                                         4"Initial version 2008/12/11,L2VPN QOS OBJECT GROUP."Z"R&D BeiJing, Huawei Technologies co.,Ltd.
                Huawei Bld.,NO.3 Xinxi Rd., 
                Shang-Di Information Industry Base,
                Hai-Dian District Beijing P.R. China
                Zip:100085 
                Http://www.huawei.com                                       
                E-mail:support@huawei.com"       --Dec 15, 2008 at 19:35 GMT
           -"Provides the information of a tunnel table."                       )"Provides the information of a VC entry."                       �"Index for the conceptual row identifying a PW within  
                this PW Emulation table.Used in the outgoing PW ID field within the 'Virtual 
                Circuit FEC Element'."                       i"The type of the Virtual Circuit.This value indicate the service carried over 
                this PW."                       "The inlabel of SVC PW."                       "The Tunnel ID."                       "The name of this Tunnel."                       1"The type of this Tunnel. e.g. LSP/GRE/CR-LSP..."                       '"The source ip address of this tunnel."                       ,"The destination ip address of this tunnel."                       "The index of lsp."                       "The out-interface of lsp."                       "The out-label of lsp."                       "The next-hop of lsp."                       "The FEC of lsp."                       &"The length of mask for hwVplsLspFec."                       #"Indicate whether the lsp is main."                       *"the outlabel of pw£¬specified for SVC."                       @"Property of Balance. Rerurn True if Tunnel-Policy is configed."                       !"The operating state of the row."                                   \"The compliance statement for systems supporting 
                the HUAWEI-PWE3-TNL-MIB."                   "The PWE3 tunnel group."                            