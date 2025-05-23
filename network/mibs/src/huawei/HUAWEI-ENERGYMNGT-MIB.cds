f-- ============================================================================
-- Copyright (C) 2022 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- Description: This mib is used for defining huawei's energy management MIB objects
-- Reference: None
-- Version:   V2.09
-- ============================================================================
                                                 "huawei energy management MIB." �"Huawei Industrial Base
  Bantian, Longgang
   Shenzhen 518129
   People's Republic of China
   Website: http://www.huawei.com
   Email: support@huawei.com
 " "202202280000Z" "202112030000Z" "201801150000Z" "201712060000Z" "201706210000Z" "201511110000Z" "201505300000Z" "201401230000Z" "201107010000Z" "201103141530Z" "201103140000Z" "201103100000Z" "201102100000Z" "201008060000Z" "201008050000Z" "201008030000Z" "201007120000Z" "201007070000Z" "201006290000Z" "201006230000Z" "201006180000Z" "201006170000Z" "201006080000Z" "201005240000Z" "V2.09 Add hwChassisPowerMngt." 0"V2.08 Add hwTypicalPower, hwBoardTypicalPower."  "V2.07 Modify the description ." ="V2.056 Modify the description of hwEnergySavingMethodIndex." @"V2.05. Modify the description of hwBoardName and hwBoardType ." 0"V2.04. Add enum of hwEnergySavingMode:optimal." j"V2.03. Add enum of hwEnergySavingMode:optimal.
                                This is a draft version." o"V2.02. Add hwEnergyDevId, hwEnergyDevChangeToSleep.
                                This is a draft version." �"V0.114. Add hwPoEType, hwPSEPower.
                                 Modify FTPC table.
                                 This is a draft version." |"V0.113, add hwEnergyFtpcIpv4TransMode and hwEnergyFtpcTransMode.
                                This is a draft version." �"V0.112, modify hwEnergyFtpcTransFileIpv4Table and hwEnergyFtpcTransFileTable.
                                This is a draft version." �"V0.111, add hwEnergyFtpcObjects, 
                                including hwEnergyFtpcTransFileIpv4Table and hwEnergyFtpcTransFileTable.
                                This is a draft version." '"V0.11, add hwEnergySavingDescReqMode." "V0.10, modify hwBoardIndex." "V0.09, modify hwBoardType." �"V0.08, modify watt to milliwatt.
                         Modify enumeration of hwEnergySavingMode.
                         Add boardType and boardDescription." ""V0.08, modify hwPowerStatPeriod." ""V0.06, modify hwPowerStatPeriod." �"V0.05, modify hwEnergySavingMethodEnable value list.
                         Delete hwEnergySavingParameterTable first index 'hwEnergySavingMethodIndex'" S"V0.05, modify hwEnergySavingCapabilityMngtEntry, modify hwEnergySavingMethodTable" 1"V0.04, modify hwEnergySavingCapabilityMngtEntry" -"V0.03, modify description for all MIB table" H"V0.02, add hwEnergySavingMethodEntry, add hwEnergySavingCapabilityMngt" "V0.01 mib initial"                   C"This object indicates the accumulated power consumption of an NE."                       D"This object indicates the update period of power consumption data."                       ["This object indicates the average power consumption of an NE within a measurement period."                       ="This object indicates the rated power consumption of an NE."                       ;"This object indicates the NE power consumption threshold."                       ?"This object indicates the current power consumption of an NE."                       �"powered type:
                PSE(1): power supplier.
                PD(2): powered deivce.
                noPoe(255): not PSE or PD"                       P"The output power(milliwatt) by a PSE. For a non-PSE device, the value is zero."                       9"This object indicates the typical consumption of an NE."                           @"This table describes board-level power consumption attributes."                       %"The entry of hwBoardPowerMngtTable."                       ("This object indicates the board index."                       '"This object indicates the board type."                       '"This object indicates the board name."                       A"This object indicates the current power consumption of a board."                       ?"This object indicates the rated power consumption of a board."                       >"This object indicates the board power consumption threshold."                       A"This object indicates the typical power consumption of a board."                           8"This object indicates the NE-level energy saving mode."                       5"This table is used to query the energy saving mode."                       '"Entry of energy-saveing method table."                       <"This object indicates the index of the energy saving mode."                       ="This object indicates the status of the energy saving mode."                       >"This table describes the variable of the energy saving mode."                       *"Entry of energy-saveing parameter table."                       <"This object indicates the index of the energy saving mode."                       ?"This object indicates the variable of the energy saving mode."                       �"This table describes the energy-saving capability, including energy-saving methods and parameters.
                The index is hwEnergySavingCapabilityDescIndex.
                "                       %"The entry of hwBoardPowerMngtTable."                       N"This object indicates the index of the energy saving capability description."                       J"This object indicates the energy saving capability description language."                       A"This object indicates the energy saving capability description."                       ^"This object indicates the method of obtaining the energy saving capability description file."                           K"This table is used to configure transfer file feature related parameters."                       )"Name identifying Transfer configuration"                       ."Name identifying FTPC Transfer configuration"                       K"Source IP address Type:
                ipv4(1)
                ipv6(2)"                       "Source IP address"                       0"VPN name used for the corresponding connection"                       H"Server address type:
                ipv4(1)
                ipv6(2)"                       "Server IP address"                       !"Server port used for connection"                       $"User Name used for user validation"                       �"Password used for user validation. Password Length while setting should not be more than
                16 characters, while querying password will be cipher text"                       "Local working directory"                       "Interface Name"                       �"The object specifies the status of this table
                entry. When the status is createAndGo, it
                allows to create  and when value is destroy
                it allows to delete the record in the table"                       �"The type of request.
                              get(1): To request a file from the FTP server.
                              put(2): To send a file to the FTP server."                       +"The file transfer protocol. Default: FTP."                      E"The OperStatus:
                 opInProgress(1): the operation is in process.
                                 opSuccess(2): the operation has been completed successfully.
                                 opInvalid(3): the command is invalid or command-protocol-device combination is unsupported by the system.
                                 opInvalidProtocol(4): invalid protocol is specified
                                 opInvalidSourceName(5) :invalid source file name is specified.    
                                 opInvalidDestName(6): invalid target name is specified.    
                                 opInvalidServerAddress(7): invalid server address is specified
                                 opDeviceBusy(8): the device is in use and locked by another process
                                 opDeviceError(9): device read, write or erase error
                                 opFileOpenError(10) :invalid file name; file not found in partition
                                 opFileTransferError(11) :file transfer was unsuccessfull
                                 opFileChecksumError(12) :file checksum in Flash is invalid
                                 opAuthFail(13) :authentication failure
                                 opUnknownFailure(14) :failure which is unknown
                                 opAbort(15) : transfer operation has been aborted
                                 opInvalidSourceAddress(16): invalid source IP is specified.
                                 opInvalidSourceInterface(17): invalid source interface is specified.
"                           '"This object identifies the device ID."                           E"This notification indicates device entering in the sleeping status."                         "Description."                   "Description."                 "Description."                 "Description."                 "Description."                         B"This table describes chassis-level power consumption attributes."                       '"The entry of hwChassisPowerMngtTable."                       '"This object indicates the chassis ID."                       ^"This object indicates the real power consumption of a chassis. The value is expressed in mW."                      