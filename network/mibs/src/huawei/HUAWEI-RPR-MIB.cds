--- ==================================================================
-- Copyright (C) 2002 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI RPR extend MIB
-- Reference:
-- Version: V1.0
-- History:
-- ==================================================================
    �"The HUAWEI-RPR-TRAP-MIB contains objects to
                Monitor the RPR TRAPs.
                
                *********************************
                RPR TRAP
                **********************************
                 This RPR TRAP consists of the following TRAPs:
                 1 :  hwRPRexcessReservedRateDefect
                 2 :  hwRPRprotMisconfigDefect
                 3 :  hwRPRtopoChange
                 4 :  hwRPRtopoInvalidDefect
                 5 :  hwRPRduplicateMacAddressDefect
                 6 :  hwRPRtopoInstabilityDefect
                 7 :  hwRPRtopoStabilityRestore
                 8 :  hwRPRPhyIfEventTrap
                 9 :  hwRPRLogicIfEventTrap
                "3" R&D BeiJing, Huawei Technologies co.,Ltd.
                Huawei Bld.,NO.3 Xinxi Rd.,
                Shang-Di Information Industry Base,
                Hai-Dian District Beijing P.R. China
                Zip:100085
                Http://www.huawei.com
                E-mail:support@huawei.com "       "-- January 09, 2006 at 00:00 GMT
           *"A table of  interface event information."                       $"Interface event information Entry."                       *"The ifIndex of this RPR logic interface."                       )"The SpanId of this RPR logic interface."                      g"Type of logic interface event.
                SD indicates that SDH Signal of the RPR logic interface degrades;
                SF indicates that SDH Signal of the RPR logic interface fails;
                MATEERR indicates that mate cable error caused by mate cable of
                the RPR physical interface is linked incorrect;
                "                      �"Type of physical interface event.
                SDHFramerSDst indicates that SDH Signal of the RPR physical interface degrades;
                SDHFramerSFst indicates that SDH Signal of the RPR physical interface fails;
                SDHFramerLOSst indicates that SDH Signal of the RPR physical interface loses;
                SDHFramerLOFst indicates that SDH framer of the RPR physical interface loses;
                SDHFramerRDIst indicates that remote Defect Indication ;
                SDHFramerAISst indicates that alarm Indication Signal;
                SDHFramerREIst indicates that remote ErrorIndication;
                Miscabling indicates that cable of the RPR physical interface is linked incorrect;
                Keepalive indicates that an exchange of messages allowing verification
                that communication between stations is not active;
                MateState indicates that mate cable of the RPR physical interface is linked incorrect.
                "                       ;"A table of RPR logic interface configuration information."                       $"RPR interface Configuration entry."                       *"The ifIndex of this RPR logic interface."                       2"The total bandwidth of this RPR logic interface."                          "This defect indicates that the amount of reserved
                bandwidth on a ringlet exceeds the available LINK_RATE.
                When an excess reserved rate defect is present,
                a notification may be generated.
                "                Y"A critical severity defect that indicates the presence
                of mismatched-protection-configuration stations, based
                on the value returned by MismatchedProtection().
                When a protection configuration defect is present
                on the station, a notification may be generated.
                "                 k"When an  topology change is present,
                a notification may be generated..
                "                �"A critical severity defect indicating that an
                invalid entry has been found within the scope
                of the topology,the stations on the ring excess
                the MAX_STATIONS or the local station has one
                or more duplicate secondary MAC addresses. When
                a topology entry invalid defect ,exceeing MaxStations
                or  duplicate secondary MAC addresses is present,
                a notification may be generated.
                "                 �"A critical severity defect indicating that a
                duplicateMacAddress has been found on the ring.
                When a duplicateMacAddress defect is present,
                a notification may be generated.
                "                 �"The critical severity Instable topology defect.
                When an Instable topology defect is present,
                a notification may be generated.
                "                 �"The critical severity Instable topology restore.
                When an stable topology  is present,
                a notification may be generated.
                "                 �"The critical severity physical interface defect.
                When an physical interface  defect is present,
                a notification may be generated.
                "                 �"The critical severity Logic interface defect.
                When an logic interface  defect that caused
                by physical interface event is present,
                a notification may be generated.
                "                �"On RPR ring, to detect the connection, a kind of packet
                is send between neighbor RPR nodes, This kind of packet 
                is SC(Single-Choke) packet, If a node cannot receive SC 
                packet from neighbor node in KEEPALIVE time, then there 
                is failure between the two nodes. When happened, auto protection 
                is executed by software.!"                �"On RPR ring, to detect the connection, a kind of packet
                is send between neighbor RPR nodes, This kind of packet 
                is SC(Single-Choke) packet, If a node cannot receive SC 
                packet from neighbor node in KEEPALIVE time, then there 
                is failure between the two nodes. When failure is resumed
                 , this notification is sent.!"                "Optical fiber is connected in error. i.e the east direction 
                of one node is connected with east direction of another node, 
                or the west direction of one node is connected with west direction 
                of another node!"                 q"when phenomena that Optical fiber is connected in error disappears,
                this notification is sent!"                H"In double RPR operating mode, east and west directions 
                of one rpr node lay on two RPR cards, These two cards are 
                internally conntected by Gigaibit-ethernet, which is called 
                MATE interface. The RPR nodes cannot work normaly under 
                condition of MATE error.!"                �"In double RPR operating mode, east and west directions 
                of one rpr node lay on two RPR cards, These two cards are 
                internally conntected by Gigaibit-ethernet, which is called 
                MATE interface. The RPR nodes cannot work normaly under 
                condition of MATE error.when MATE error is resumed ,this 
                notification is sent!"                "On RPR physical layer, link connection is detected 
                through physical singal. When can't receive physical
                 singal, then local node from neighbor node, LOS(lost of signal) 
                 alarm is report, auto protection is executed by software.!"                V"On RPR physical layer, link connection is detected 
                through physical singal. When can't receive physical
                singal, then local node from neighbor node, LOS(lost of signal) 
                alarm is report, auto protection is executed by software.when LOS
                is resumed,this notification is sent"                         n"The compliance statement for entities that implement
                RPRTRAP on a router.
                "                   5"provide RPRTRAP objects configuration information. "                 Z"Required objects to provide RPRTRAP objects configuration
                information. "                     "Description."                            