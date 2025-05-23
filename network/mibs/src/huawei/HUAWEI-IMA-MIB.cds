�-- =================================================================
-- Copyright (C) 2018 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI Private IMA Interface MIB
-- Version: V2.12
-- History:
--      V1.0 
-- ==================================================================
-- ==================================================================
-- 
-- Variables and types be imported
-- 
-- ==================================================================
   ,"State of a link belonging to an IMA group."               "Length of the IMA frames."               "State of the IMA group."               ="The group symmetry mode adjusted during the group start-up."               "Time in milliseconds"                                 a"The MIB is mainly used to configure Inverse Multiplexing
            for ATM (IMA) interfaces." �"Huawei Industrial Base
              Bantian, Longgang
               Shenzhen 518129
               People's Republic of China
               Website: http://www.huawei.com
               Email: support@huawei.com
             " "201801130000Z" "201702170000Z" !"V2.12, modify node description." 6"V2.11, modify the description of hwImaNotifications."       -- Jan13,2018at 00:00 GMT
           $"The IMA Group Configuration table."                       ""An entry in the IMA Group table."                      ;"This object identifies the logical interface number ('ifIndex')
            assigned to this IMA group, and is used to identify corresponding
            rows in the Interfaces MIB.
            Note that re-initialization of the management agent may cause
            a client's 'hwImaGroupIfIndex' to change."                       U"The current operational state of the near-end IMA Group State
            Machine."                       T"The current operational state of the far-end IMA Group State
            Machine."                       "Symmetry of the IMA group."                       w"Minimum number of transmit links required to be Active for
            the IMA group to be in the Operational state."                       v"Minimum number of receive links required to be Active for
            the IMA group to be in the Operational state."                      X"The ifIndex of the transmit timing reference link to be
            used by the near-end for IMA data cell clock recovery from
            the ATM layer. The distinguished value of zero may be used
            if no link has been configured in the IMA group, or if the
            transmit timing reference link has not yet been selected."                      T"The ifIndex of the receive timing reference link to be
            used by near-end for IMA data cell clock recovery toward
            the ATM layer. The distinguished value of zero may be used
            if no link has been configured in the IMA group, or if the
            receive timing reference link has not yet been detected."                       ;"The IMA ID currently in use by the near-end IMA function."                       :"The IMA ID currently in use by the far-end IMA function."                       �"The frame length to be used by the IMA group in the transmit
            direction. Can only be set when the IMA group is startup."                       A"Value of IMA frame length as received from remote IMA function."                       �"The maximum number of milliseconds of differential delay among
            the links that will be tolerated on this interface."                       �"This indicates the 'alpha' value used to specify the number
            of consecutive invalid ICP cells to be detected before moving
            to the IMA Hunt state from the IMA Sync state."                       �"This indicates the 'beta' value used to specify the number
            of consecutive errored ICP cells to be detected before moving
            to the IMA Hunt state from the IMA Sync state."                       �"This indicates the 'gamma' value used to specify the number
            of consecutive valid ICP cells to be detected before moving
            to the IMA Sync state from the IMA PreSync state."                       o"The number of links which are configured to transmit and are
            currently Active in this IMA group."                       n"The number of links which are configured to receive and are
            currently Active in this IMA group."                       5"IMA OAM Label value transmitted by the NE IMA unit."                       �"IMA OAM Label value transmitted by the FE IMA unit. The value 0
            likely means that the IMA unit has not received an OAM Label
            from the FE IMA unit at this time."                       :"This object identifies the first link of this IMA Group."                       !"The name of interface ImaGroup."                       G"The clock mode to be used by the IMA group in the transmit direction."                       9"Mode of IMA clock as received from remote IMA function."                       4"The IMA group Link Status and Configuration table."                       '"An entry in the IMA Group Link table."                       �"This corresponds to the 'ifIndex' of the MIB-II interface
            on which this link is established. This object also
            corresponds to the logical number ('ifIndex') assigned to
            this IMA link."                       �"This object identifies the logical interface number ('ifIndex')
            assigned to this IMA group. The specified link will be bound to
            this IMA group."                       2"The current state of the near-end transmit link."                       1"The current state of the near-end receive link."                       X"The current state of the far-end transmit link as reported
            via ICP cells."                       W"The current state of the far-end receive link as reported
            via ICP cells."                      �"The hwImaLinkRowStatus object allows create, change, and delete
            operations on hwImaLinkTable entries.
            To create a new conceptual row (or instance) of the hwImaLinkTable,
            hwImaLinkRowStatus must be set to 'createAndWait' or 'createAndGo'.
            A successful set of the imaLinkGroupIndex object must be performed
            before the hwImaLinkRowStatus of a new conceptual row can be set to
            'active'.
            To change (modify) the imaLinkGroupIndex in an hwImaLinkTable entry,
            the hwImaLinkRowStatus object must first be set to 'notInService'.
            Only then can this object in the conceptual row be modified.
            This is due to the fact that the imaLinkGroupIndex object provides
            the association between a physical IMA link and the IMA group to
            which it belongs, and setting the imaLinkGroupIndex object to a
            different value has the effect of changing the association between
            a physical IMA link and an IMA group. To place the link 'in group',
            the hwImaLinkRowStatus object is set to 'active'. While the row is
            not in 'active' state, both the Transmit and Receive IMA link state
            machines are in the 'Not In Group' state.
            To remove (delete) an hwImaLinkTable entry from this table, set
            this object to 'destroy'."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                       "Description."                               k"A set of objects providing configuration and status information for
            an IMA group definition."                 @"A set of objects providing status information for an IMA link."                 E"A set of NOTIFICATION providing alarm information for an IMA group."                     D"A set of NOTIFICATION providing alarm information for an IMA link."                         u"The compliance statement for network elements implementing
         Inverse Multiplexing for ATM (IMA) interfaces."   "Write access is not required." "Write access is not required." "Write access is not required." "Write access is not required."                 7"This object indicates the near-end IMA group failure."                 U"This object indicates that the alarm for the near-end IMA group failure is cleared."                 6"This object indicates the far-end IMA group failure."                 T"This object indicates that the alarm for the far-end IMA group failure is cleared."                 "This object indicates that an alarm is generated when the transmit clock modes at the two ends of the IMA group do not match."                 �"This object indicates that the alarm generated when the transmit clock modes at the two ends of the IMA group did not match is cleared."                 a"This object indicates that an alarm is generated when out of frame (OOF) occurs on an IMA link."                 T"This object indicates that the alarm generated for OOF on the IMA link is cleared."                 |"This object indicates that an alarm is generated when the differentiated delay on an IMA link exceeds the upper threshold."                 �"This object indicates that the alarm generated when the differentiated delay on the IMA link exceeded the upper threshold is cleared."                 S"This object indicates that an alarm is generated when the far-end IMA link fails."                 ]"This object indicates that the alarm generated for the far-end IMA link failure is cleared."                 k"This object indicates that an alarm is generated when the IMA transmit link at the far end goes abnormal."                 n"This object indicates that the alarm generated for the abnormal IMA transmit link at the far end is cleared."                 j"This object indicates that an alarm is generated when the IMA receive link at the far end goes abnormal."                 m"This object indicates that the alarm generated for the abnormal IMA receive link at the far end is cleared."                                                