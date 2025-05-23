-- ===================================================================
-- Copyright (C) 2020 by HUAWEI TECHNOLOGIES. All rights reserved.
-- Description: 
-- Reference:
-- Version: V1.07
-- ===================================================================
                 �"This MIB is to provide TRAP support for NTP.
                hwNtpStateChangeTrap & hwNtpSysPeerChangeTrap are added to notify the 
                NTP state change & system peer change information" �"Huawei Industrial Base
  Bantian, Longgang
   Shenzhen 518129
   People's Republic of China
   Website: http://www.huawei.com
   Email: support@huawei.com
 " "202007071600Z" "202003121600Z" "202003101600Z" "202003031600Z" "201909181600Z" "201906182200Z" "201610181600Z" "201508111600Z" M"V1.07, adding hwNtpSynchronizationFailure hwNtpSynchronizationFailureResume" h"V1.06, adding hwNtpMaxPacketRecvPerSecReach, hwNtpMaxPacketRecvPerSecResume, hwNtpMaxPacketRecvPerSecr" 3"V1.05, modify hwNtpMaxDynamicSessionsrange 0..100" k"V1.04, adding hwNtpDynamicSessionLimitReach, hwNtpDynamicSessionLimitReachResume, hwNtpMaxDynamicSessions" 8"V1.03, fixing the description of hwNtpCurrentClientNum" ["V1.02, adding hwNtpClientLimitExceed, hwNtpClientLimitExceedResume, hwNtpCurrentClientNum" 9"V1.01, adding hwNtpSourceVpnName, hwNtpOldSourceVpnName" "V1.00, initial version."                   %"Indicates the NTP local clock state"                       F"Specifies server IP address to which local NTP clock is synchronized"                       ^"Indicates Vpn instance associated with the peer to which the local NTP clock is synchronized"                       Q"Specifies server IP address to which local NTP clock was synchronized last time"                       h"Indicates Vpn instance associated with the peer to which the local NTP clock is synchronized last time"                       D"The value of this object identifies the current ntp client number."                       I"The value of this object identifies the maximum dynamic session number."                       T"The value of this object identifies the current packet numbers which ntp received."                          }"This TRAP is used to notify when the NTP state changes from synchronized to unsynchronized & vice-versa.
                 NTP state changes occur due to reasons listed below
 			1) System clock is reset by configuration.
 			2) Selected peer is deleted by configuration.
 			3) Selected peer is unreachable.
			4) Authentication failed for selected peer.
			5) Selected peer clock is not synchronized.
			6) Time elapsed since peer clock's last update is not within permissible limit.
			7) Source stratum is greater than the local stratum.
			8) System synchronization source lost.
			9) NTP mode mismatch for selected peer."                 �"This TRAP is used to notify the NTP system peer change from one source IP to other source IP without state change.
                This trap is generated when the selected NTP peer is changed"                 ?"This TRAP is used to notify the NTP client path limit exceed."                 7"This NTP client path limit exceed alarm was repaired."                 B"This TRAP is used to notify the NTP dynamic session limit reach."                 :"This NTP dynamic session limit reach alarm was repaired."                 Y"This TRAP is used to notify the NTP packet processing rate reaches the upper threshold."                 Q"This NTP packet processing rate reaches the upper threshold alarm was repaired."                 ]"This TRAP is used to notify when the NTP state changes from synchronized to unsynchronized."                 3"This NTP state unsynchronized alarm was repaired."                         "NTP trap MIB compliance."               6"These objects are used to manage NTP trap parameters"                 7"These objects are used to manage NTP trap parameters."                    