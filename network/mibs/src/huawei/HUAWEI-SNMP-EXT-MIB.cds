D-- =================================================================
-- Copyright (C) 2016 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: HUAWEI Private Extended SNMP MIB
-- 
-- Reference:
-- Version:     V2.05
-- History:
-- 
-- =================================================================
     N"
                Some attribute of SNMP extended content.
                "
"Huawei Industrial Base
                   Bantian, Longgang
                    Shenzhen 518129
                    People's Republic of China
                    Website: http://www.huawei.com
                    Email: support@huawei.com
                  " "201612071056Z" "201302280000Z" "201307091300Z" "201310111603Z" "201402141603Z" "revision 2.0.5" U"Registration point for protocols used in Huawei 
                extended SNMP MIB" "revision 2.0.2" "revision 2.0.3" "revision 2.0.3"       --Dec. 07, 2016 at 10:56 GMT
           c"Enabled or disabled SNMP extended error status. 
                 The default value is disabled."                       /"The type of the remote netmanager IP address."                       *"The Ip address of the remote netmanager."                           !"The listening UDP port of SNMP."                       *"The raising threshold of the lock queue."                       *"The falling threshold of the lock queue."                           �"Registration point for authentication protocols used in Huawei 
                extended SNMP MIB. Definitions of Object Identities needed
                for the use of AES by SNMP's User-based Security Model
                "               3"The HMAC SHA2 256 Digest Authentication Protocol." �"- Data Encryption Standard, National Institute of
                    Standards and Technology.  Federal Information
                    Processing Standard (FIPS) Publication 46-1.
                    Supersedes FIPS Publication 46"             �"Registration point for privacy protocols used in Huawei 
                extended SNMP MIB. Definitions of Object Identities needed
                for the use of AES by SNMP's User-based Security Model
                "               -"The 3DES-EDE Symmetric Encryption Protocol."�"- Data Encryption Standard, National Institute of
                          Standards and Technology.  Federal Information
                          Processing Standard (FIPS) Publication 46-3,
                          (1999, pending approval).  Will supersede FIPS
                          Publication 46-2.

                        - Data Encryption Algorithm, American National
                          Standards Institute.  ANSI X3.92-1981,
                          (December, 1980).

                        - DES Modes of Operation, National Institute of
                          Standards and Technology.  Federal Information
                          Processing Standard (FIPS) Publication 81,
                          (December, 1980).

                        - Data Encryption Algorithm - Modes of Operation,
                          American National Standards Institute.
                          ANSI X3.106-1983, (May 1983).
                       "             &"The CFB128-AES-192 Privacy Protocol.""- Specification for the ADVANCED ENCRYPTION 
		                     STANDARD (DRAFT). Federal Information Processing  
		                     Standard (FIPS) Publication 197. 
		                     (November 2001). 
    
		                     - Dworkin, M., NIST Recommendation for Block  
		                       Cipher Modes of Operation, Methods and  
		                       Techniques (DRAFT).  
		                       NIST Special Publication 800-38A 
		                       (December 2001). 
		                     "             &"The CFB128-AES-256 Privacy Protocol.""- Specification for the ADVANCED ENCRYPTION 
	                       STANDARD (DRAFT). Federal Information Processing  
	                       Standard (FIPS) Publication 197 
	                       (November 2001). 
    
	                     	- Dworkin, M., NIST Recommendation for Block  
	                       Cipher Modes of Operation, Methods and  
	                       Techniques (DRAFT).  
	                       NIST Special Publication 800-38A 
	                       (December 2001). 
                      	"                 "SNMP Test trap."                 "SNMP Test trap."                     "Alarm trap nodes."                             ?"Collection of objects needed for SNMP extended configuration."                 "SNMP extend trap nodes."                         S"The compliance statement for implementing
			      the Huawei extended SNMP MIB."                   q"The trap will be triggered when the number of unauthorized users reaches the upper threshold of the lock queue."                 w"The trap will be triggered when the number of unauthorized users falls back to the lower threshold of the lock queue."                 �"After the SNMP process is restarted or a master/slave main control board switchover is performed on a device, this trap is sent to notify the NMS of SNMP entity restart, enabling the NMS to synchronize alarms from the device."                            