]--  ==================================================================
-- Copyright (C) 2017 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI-TRILL-CONF-MIB provides information about TRILL
-- Reference:
-- Version: V1.04
-- History:
-- <author>,   <date>,  <contents>
--  HUAWEI   2009-08-03  TRILL private MIB
-- ==================================================================
-- ==================================================================
-- 
-- Variables and types are imported
-- 
-- ==================================================================
    "
				The HUAWEI PRIVATE MIB contains objects belonging to processes of the TRILL protocol existing on the system. 
				It defines the model used to represent data that exists elsewhere in the system and on peripheral devices. 
				There are no constraints on this MIB." �"Huawei Industrial Base
				Bantian, Longgang
				 Shenzhen 518129
				 People's Republic of China
				 Website: http://www.huawei.com
				 Email: support@huawei.com
				" "201708171637Z" "201606131637Z" "201505071524Z" "201504271524Z" "201406121655Z" "revision 1.0.4" "revision 1.0.3" "revision 1.0.2" v"revision 1.0.1,modify description of hwTrillAuthenticationFailure and hwTrillAuthenticationTypeFailure at 2015-04-27" "revision 1.0.0"        --August 17, 2017 at 21:50 GMT
               2"This table describes TRILL instance information."                       "Description."                       "Trill instance id."                       "Trill system id."                       ""Trill remaining-lifetime of LSP."                       "Trill LSP id."                       C"This table describes nickname information about an TRILL network."                       "Description."                       "Trill nickname."                       "Trill priority."                       J"This table describes information on TRILL ports' authentification modes."                       "Description."                       "Trill instance id."                        "Trill circuit interface index."                       "64-byte PDU fragment."                           "Description."                 "Description."                 "Description."                     "Description."                     6"The local nickname conflicted with another nickname."                 *"The local nickname conflict was cleared."                 �"The alarm is generated if the device receives a PDU carrying an authentication password that is different from the local one. The PDU fragment is displayed in the alarm, helping network administrators locate the device that sent the PDU."                 �"The alarm is generated if the device receives a PDU carrying an authentication mode that is different from the local one. The PDU fragment is displayed in the alarm, helping network administrators locate the device that sent the PDU."                 W"This object indicates that the Remaining Lifetime of a received LSP is less than 60s."                     "Description."                                              