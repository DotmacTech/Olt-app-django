�--     =================================================================
-- Copyright (C) 2004 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: This mib file is used for inquiring for MP (Multilink PPP)
--              link status information.
-- Reference:
-- Version:     V1.0
-- History:
--              tianli,2004.5.18,publish 
-- =================================================================
                    �"The HUAWEI-MP-MIB provides read access to MP(Multilink PPP) link
            status information. The information available through this MIB includes:
            the father channel, the bundled son channel, the slot on which MP bundled, 
            the number of son channels, the bundle name,
            the statistic of lost fragments, reordered packets, unassigned packets, 
            interleaved packets, and the received/sent sequence, etc.
            "D" R&D BeiJing, Huawei Technologies co.,Ltd.
            Huawei Bld.,NO.3 Xinxi Rd., 
            Shang-Di Information Industry Base,
            Hai-Dian District Beijing P.R. China
            Zip:100085 
            Http://www.huawei.com                                       
            E-mail:support@huawei.com "       -- May 18, 2004 at 00:00 GMT
           �"This table describes the information of MP link. 
            The index of this table is the interface index of MP group or 
            VT(Virtual Template)."                      �"Each entry in this table describes the information of MP link.
            The available information includes: 
            the father channel, the slot on which MP bundled, 
            the number of bundled son channels, 
            the statistics of lost fragments, reordered packets, 
            unassigned packets, interleaved packets, 
            and received/sent sequence.             
            "                       �"The interface name of the father interface on which MP bundled. 
            It is the name of a Virtual Template or a MP group."                       �"The bundle name of the multilink. 
            when authentication is configured, the bundle name is the authenticated
            user name; when authentication not configured, the bundle name is
            multilink.
            "                       ."The slot on which MP bundled. 
            "                       8"The number of the bundled son channel of the MP link. "                       �"The number of fragments of the MP link discarded because 
            bad fragments received, or assembling packet failed, etc."                       H"The number of received packets of the MP link reordered.
            "                       U"The number of received packets of the MP link waiting for reordering.
            "                       �"The number of received packets of the MP link interleaved by the 
            packets queued in RTPQ(Real-time Transport Protocol Queue) or 
            LLQ(Low Latency Queue).
            "                       I"The current sequence number of the MP link for receiving.
            "                       G"The current sequence number of the MP link for sending.
            "                       �"The time of detecting the flapping of the son channel of the MP link 
            to determine whether the son channel should be damped.
            "                       �"The maximum number of the flapping in the detect-time; if the flapping
            number is more than the maximum number, the son channel will be damped.
            "                       C"The time of damping the son channel of the MP link.
            "                       �"The minimum number of the bundled son channel of the MP link; if the number
            of the bundled son channel is less than the minimum number, the MP link can
            not be used.
            "                       m"It shows the reorder feature on MP interface. 
            1 shows enable ; 2 shows disable.
            "                       �"This table describes the information of son channels of the MP link.
            The index of this table is the interface index of MP group or
            VT(Virtual Template). 
            "                      "Each entry in this table describes the information of the bundled
            son channels of MP link. The available information includes: 
            the interface index of the son channel, 
            the interface name of the son channel.
            "                       �"The bundled sequence number of the son channels of the MP link.
            This object is one of the index of the table.
            "                       G"The interface index of the son channels of the MP link.
            "                       F"The interface name of the son channels of the MP link.
            "                       |"The MP status of the son channels of the MP link.
            0 shows failed bind; 1 shows successful bind.
            "                               +"The son channel of the MP link is damped."                 ;"The son channel of the MP link is recovered from damping."                 *"The MP link is controlled for threshold."                 :"The MP link is recovered from controlling for threshold."                         d"The compliance statement for entities which 
             implement the Huawei Multilink PPP mib."                   ="A collection of objects providing mandatory MP information."                 ("All running information of MP feature."                 "Group for all MP traps."                                    