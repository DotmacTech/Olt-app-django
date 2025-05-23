f--  ==================================================================
-- Copyright (C) 2007 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI TDMoPSN Management MIB
-- Reference:
-- Version: V1.0
-- History:
--      V1.0 songguozhong, 2007-06-27, publish
-- ==================================================================
     8"The HUAWEI-TDM-PSN-MIB contains objects to manage TDM."2"R&D BeiJing, Huawei Technologies co.,Ltd.
            Huawei Bld.,NO.3 Xinxi Rd., 
            Shang-Di Information Industry Base,
            Hai-Dian District Beijing P.R. China
            Zip:100085 
            Http://www.huawei.com                       
            E-mail:support@huawei.com"                   9"This table provides per TDM PW performance information."                       '"An entry in hwTdmPsnPerfCurrentTable."                       �"Index for the conceptual row identifying a PW within  
            this PW Emulation table.Used in the outgoing PW ID field 
            within the 'Virtual Circuit FEC Element'."                       k"The type of the Virtual Circuit.This value indicate the 
            Service to be carried over this PW."                       ^"Number of missing packets (as detected via control word 
            Sequence number gaps)."                       �"Number of packets detected out of sequence (via control
            word sequence number), but successfully re-ordered.
            Note: some implementations may not support this Feature."                       `"Number of times a packet needed to be played
            out and the jitter buffer was empty."                       �"Number of packets detected out of order(via control word
            Sequence numbers), and could not be re-ordered, or could
            not fit in the jitter buffer."                       V"Number of packets detected with unexpected size, or
            bad headers' stack."                       �"The counter associated with the number of Error
            Seconds encountered.Any malformed packet, seq. error and
            similar are considered as error second."                       \"The counter associated with the number of
            Severely Error Seconds encountered."                       �"The counter associated with the number of
            Unavailable Seconds encountered. Any consequtive
            five seconds of SES are counted as one UAS."                      X"TDM Failure Counts (FC-TDM). The number of TDM failure
            events. A failure event begins when the LOPS failure
            is declared, and ends when the failure is cleared. A
            failure event that begins in one period and ends in
            another period is counted only in the period in which
            it begins."                       4"This table provides per CEP PW Status information."                       !"An entry in hwTdmPsnAlarmTable."                       �"Index for the conceptual row identifying a PW within  
            this PW Emulation table.Used in the outgoing PW ID field 
            within the 'Virtual Circuit FEC Element'."                       k"The type of the Virtual Circuit.This value indicate the 
            Service to be carried over this PW."                      9"This variable indicates the Line Status of the
            interface.  It contains PW alarms information.    
            The hwTdmPsnInfoPwStatus is a bit map represented as a
            Sum, therefore, it can represent multiple alarms simultaneously.
            PwNoAlarm must be set if and only if no other flag is set.
            The various bit positions are:
                0 bit     PwNoAlarm       No alarm present
                1 bit     PwRAI           Remote Alarm Indication
                2 bit     PwAIS           Alarm Indication Signal "                       "Index of E1 or T1 interface."                           l"A hwTdmPsnAlarmTrap trap is sent when the
            value of an instance hwTdmPsnAlarmPwStatus changes."                         #"The compliance statement for TDM."                   '"The hwTdmPsnPerfCurrentTable's group."                 !"The hwTdmPsnAlarmTable's group."                 &"The TdmPsn's SVC Notification group."                                