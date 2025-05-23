c--  ===========================================================================
-- Copyright (C) 2015 by HUAWEI TECHNOLOGIES. All rights reserved.
-- Description: HUAWEI MSDP MIB
-- Reference:   Module(HUAWEI-MSDP-MIB).
-- Version:     V1.01
-- History:     
-- V1.00
-- ===========================================================================
                     �"The MIB module for management of PIM routers.
                
                Huawei Technologies co.,Ltd . Supplementary information may
                be available at:
                http://www.huawei.com""Huawei Industrial Base
                  Bantian, Longgang
                   Shenzhen 518129
                   People's Republic of China
                   Website: http://www.huawei.com
                   Email: support@huawei.com
                 " "201502050000Z" "200910310000Z" A"Delete hwPimTuningParametersGroup from hwMsdpMIBFullCompliance." *"The initial revision of this Mib module."       #-- February 05, 2015 at 00:00 GMT
                       "The instance ID of the trap."                        "The instance name of the trap."                      �"The reason for trap sending.
                  1.HoldTime expired
                  2.TCP not establish
                  3.Socket error
                  4.Receive invalid TLV
                  5.Receive notification TLV
                  6.User operation
                  7.Peer Up again
                  8.Delete peer
                  9.Alarm timeout
                  100.Alarm Clear"                           W"A hwMsdpNeighborUnavailable notification signifies that the MSDP peer is unavailable."                 Y"A hwMsdpNeighborUnvailableClear notification signifies that the MSDP peer is available."                         "Description."             -- this module
 /"The compliance statement for HUAWEI-MSDP MIB."   "This group is optional."                 "Description."                 "Description."                                