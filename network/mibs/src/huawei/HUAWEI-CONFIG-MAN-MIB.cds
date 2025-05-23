{-- =================================================================
-- Copyright (C) 2022 by  HUAWEI TECHNOLOGIES. All rights reserved.
--
-- Description: configuration mangement mib
-- Reference:   huawei enterprise mib
-- Version:     V2.36
-- History:
--                initial version 2002-12-20
-- =================================================================
  /"Specify operation types on configuration.
            Currently, following types of operation are provided:
            running2Startup(1):refresh the saved configuration file used currently 
                       with current configuration running in the system. The 
                       operation is the same as that of 
                       [save]  command from command line.(running->startup)
            startup2Running(2):append the configration of the saved configuration file used currently 
                       to current configuration running in the system.(running<-startup)
            running2Net(3):Send the current configuration running in the system to the network
                       through a certain protocol.(running->networkFile)
            net2Running(4):append the configration of a remote file from network to current configuration running 
       in the system through a certain protocol.(running<-networkFile)
            net2Startup(5):Download a remote file to the local system to be the saved configuration file used currently
                       through a certain protocol.(startup<-networkFile)
            startup2Net(6):Send the saved configuration file used currently to the network 
                         through a certain protocol. (startup ->networkFile)"                                                                                             ,"The description of some nodes was changed." �"Huawei Industrial Base
                Bantian, Longgang
                 Shenzhen 518129
                 People's Republic of China
                 Website: http://www.huawei.com
                 Email: support@huawei.com
               " "202210151000Z" "202206251000Z" "202206131000Z" "202202101000Z" "202110271000Z" "202108121000Z" "202103101000Z" "202101201910Z" "202012291910Z" "202012291910Z" "202012211910Z" "202012151010Z" "202008181610Z" "201807181610Z" "201807021610Z" "201805281610Z" "201802271610Z" "201801271610Z" "201712271610Z" "201708021727Z" "201605261925Z" "201603251010Z" "201602221010Z" "201504271402Z" "201504131119Z" "201502022300Z" "201409182200Z" "201409161020Z" "201408211602Z" "201405292230Z" "201405262230Z" "201309032230Z" "201308302230Z" "200608222230Z" "200608222230Z" "200608222230Z" "200608222230Z" :"Modiffy trap node hwcfgStartupFileIntegrityFailFileType." Y"Modiffy trap node hwCfgMinisystemConfigRecovery and hwCfgMinisystemConfigRecoveryClear." Y"Add new trap node hwCfgMinisystemConfigRecovery and hwCfgMinisystemConfigRecoveryClear." E"Modify the OBJECTS of the hwcfgStartupFileIntegrityFailResume node." >"The value range of the hwCfgOperateState object was changed." ~"Add new trap node hwCfgNextStartupFileIntegrityFail , hwCfgStartupFileIntegrityFail and hwCfgStartupFileIntegrityFailResume." Y"Modify the datatype of hwCfgBackupServerIp, and new MIB node hwCfgBackupServerAddrType." J"Add new mib node hwCfgBackupServerPort of table HwCfgBackup2ServerEntry."�"The HUAWEI-CONFIG-MAN-MIB contains objects to manage the system configuration. 
            It defines the model used to represent configuration data that exists elsewhere 
            in the system and in peripheral devices. The MIB is proper for system configuration.
            NMS can query configuration change log information and operate configuration.
            There are no constraints on this MIB." A"The value range of the hwCfgOperateProtocol object was changed." >"The value range of the hwCfgOperateState object was changed." C"The value range of the hwCfgOperateServerPort object was changed." }"The description of hwCfgRestoreErrCode was changed. Add trap node hwCfgMemoryInsufficient and hwCfgMemoryInsufficientResume" A"The type of the hwCfgConfigChangeSrcAddress object was changed." B"The value range of the hwCfgSaveAutoCpuLimit object was changed." E"Add new trap node hwCfgConfigChangeLog of hwConfigManNotifications." d"Add new trap node hwCfgLockConfiguration and hwCfgunLockConfiguration of hwConfigManNotifications." V"add trap node hwNextStartupFileInconsistent and hwNextStartupFileInconsistentResume." /"modified trap node value hwCfgRestoreSuccess." W"modified trap node value hwCfgAppDataInconsistent and hwCfgAppDataInconsistentResume." 0"modified trap node value hwCfgRestoreErrCode ." 5"modified trap node name hwConfigInconsistentResume." A"modified trap node hwConfigInconsistent and hwConfigConsistent." <"add trap node hwConfigInconsistent and hwConfigConsistent." _"modified  trap node hwCfgRestoreFail, and  MIB node hwCfgRestoreErrCode for hwCfgRestoreFail." `"Add new trap node hwCfgRestoreFail, and new MIB node hwCfgRestoreErrCode for hwCfgRestoreFail." ;"Modify the length and description of hwCfgBackupPassword." 1"Modify the description of hwCfgOperateFileName." ;"Modify the length and description of hwCfgBackupPassword." 2"Modify the length range of hwCfgLogTerminalUser." 2"Modify the length range of hwCfgLogTerminalUser." @"Add new mib node hwCfgOperateVpnInstance of hwCfgOperateEntry." g"Add new mib node hwCfgOperateServerAddressType and hwCfgOperateServerAddressNet of hwCfgOperateEntry." K"Add new mib node hwCfgBackupVpnInstance of table HwCfgBackup2ServerEntry." 0"Modify the description of hwCfgBackupProtocol." M"Modify the description of hwCfgBackupPassword And hwCfgOperateUserPassword." +"The initial revision of this MIB module ."        -- October 15 2022 at 10:00GMT
               �"The object records the value of sysUpTime when the current configuration
             running in the system was last modified."                      G"The object records the value of sysUpTime when the current configuration
             running in the system was last saved.
                                 
             If the value of the object is smaller than
             hwCfgRunModifiedLast, the current configuration has been
             modified but not saved."                      "The object records the value of sysUpTime when the saved configuration 
             used currently was last modified. It may have been changed by a save of the     
             current configuration running in the system or other methods such as copy."                       �"The object shows the maximum number of rows in
            hwCfgLogTable. The value supported by the system is 10.
            "                       O"The total number of rows deleted from hwCfgLogTable.           
            "                      $"Decides whether or not to backup the configuration log information.
            If the value is true, the data of configuration log on the master 
            will be sent to slave. Otherwise the data of log will be lost when 
            master switches to slave. Default value is true."                       <"A table of configuration log on this device.
            "                       7"Information about a configuration log in this system."                      	"
            The index of hwCfgLogTable, which is a incremental integer.
            The maximum value of the node is 2147483647.The table should wrap the
            value to 1 and flush all the existing entries when the maximum value
            is reached."                       C"Specifies the sysUpTime when the configuration log was generated."                      >"Specifies the source command resulting in the log.
            Currently we provide the types of source:
            1.cmdLine(1):configuration log instigated by command line.
            2.snmp(2):configuration log instigated by snmp.
            3.other(3):configuration log instigated by other source unknown."                      �"The configuration data source for the event.
            erase        erasing destination 
            running        operational data alive
            commandSource    the command source itself
            startup        what the system will use next reboot
            local        local NVRAM or flash
            netFtp            FTP network transfer
            hotPlugging     board is inserted or pulled out on line                
            "                      �"The configuration data destination for the event.
            unknown        unknown 
            running        operational data alive
            commandSource    the command source itself
            startup        what the system will use next reboot
            local        local NVRAM or flash
            netFtp            FTP network transfer
            hotPlugging     board is inserted or pulled out on line"                      �"Specifies the terminal type.
            
            If hwCfgLogSrcData is not 'cmdLine', the value of the object is 'notApplicable'.
            
            The value list:
            notApplicable(1): no meaning at this time.
            unknown(2): unknown terminal type.
            console(3):
            terminal(4)
            virtual(5)
            auxiliary(6)"                      !"
            The name of a logging user which is available when hwCfgLogSrcCmd 
            is 'cmdLine'. When hwCfgLogTerminalType is 'virtual' and user login
            in authentication, the object will be the name of the user. 
            Otherwise, it is a zero length string."                      '"Specifies the terminal number.
            
            If hwCfgLogSrcCmd variable is not 'cmdLine'(such as 'snmp'or 'other'), the value of the object is '-1'.
            If  hwCfgLogSrcCmd variable is  'cmdLine', the value '-1' means that it is not the active terminal user.
            "                       �"The available location of the terminal when hwCfgLogSrcCmd 
            is 'cmdLine'. Otherwise, it is a zero length string.
            "                      �"                       
            The address from which a request comes when the value of hwCfgLogSrcCmd is 'snmp(2)'.    
            
            The ip address of the remote system connected when the value of hwCfgLogTerminalType
            is 'virtual'.
                                                                       
            Otherwise, the value of the object is 0.0.0.0.
            "                       �"The available host name of the remote system connected if 
            hwCfgLogTerminalType has the value of 'virtual'.
            Otherwise, the value of the object is a zero length string.
            "                       �"The user name used when hwCfgLogSrcData or hwCfgLogDesData has 
            the value of 'netFtp'.
            Otherwise, the value of the object is a zero length string.
            "                       �"The remote server address when hwCfgLogSrcData or hwCfgLogDesData 
            has the value of 'netFtp'.
            Otherwise, the value of the object is 0.0.0.0.
            "                       �"The remote file name when hwCfgLogSrcData or hwCfgLogDesData has
             the value of 'netFtp'.
             Otherwise, the value of the object is a zero length string.
            "                       t"This is the sequence ID of configuration. When configuration is changed, ID is added.               
            "                       T"Specifies the time of system confiuration was baseline.             
            "                           �"The maximum number of copy entries that may be held
            in hwCfgOperateTable.  A particular setting does not guarantee 
            that much data can be held.
            "                       �"This value indicates the primary reference time of the hwCfgOperateEntry 
            saved in the hwCfgOperateTable. Default value is 5."                       �"The maximum number of copy entries that may be held
            in hwCfgOperateResultTable. Default value is 5.
            "                       5"A table of config-operation requests.
            "                       "An operate request entry."                       0"The unique index value of a row in this table."                       �"Specifies the type of an operation on configuration.
            For detailed information, please see the ConfigOperationType 
            definition.
            "                      �"If the value of hwCfgOperateType is running2Net,net2Running,net2Startup
             or startup2net,  this object specifies the protocol which is 
            used for file transfer . 
            The default protocol is ftp if no protocol is specified.  
            And for other value of hwCfgOperateType , this object may   
            be ignored by the implementation.
            When hwCfgOperateProtocol is specified as SFTP, only password
            authentication-type is valid. "                      ="When the object of hwCfgOperateType has the value of net2Startup, net2Running or 
            running2Net, the value must be specified. The file name may include the path if
            applicable.
            If the value of hwCfgOperateType is net2Startup or net2Running, this node specifies the
            source file name of transfers. If the value of hwCfgOperateType is running2Net, this 
            node specifies the destination file name of transfers. If the value of hwCfgOperateType 
            is running2Startup, this node specifies the saved file name of current running 
            configuration.

            When hwCfgOperateType has the value of startup2Net or startup2Running, the object may not be
            created instead of using the file name of startup configuration file.
            "                      "When the operation type is running2Net,net2Running,net2Startup
             or startup2net , the ip address of the FTP/TFTP/SFTP server from/to 
            which to download/upload must be specified.  
            Values of 0.0.0.0 or FF.FF.FF.FF are not permitted."                      /"When the operation type is running2Net,net2Running,net2Startup
             or startup2net , the user 
            name for the FTP/SFTP server from/to which to download/upload
            should be specified. The object must be created if hwCfgOperateProtocol
            has the value of 'ftp'. "                      �"When the operation type is running2Net,net2Running,net2Startup
             or startup2net , the user 
            password for the FTP/SFTP server from/to which to download/upload
            should be specified. The object must be created if hwCfgOperateProtocol
            has the value of 'ftp'. 
           When get the value of the field, the device will return a zero-length string.
           When set the field, its value cannot be a string that contains no character."                       l"Specifies whether or not a notification should be 
            issued on the completion of the operation."                      �"The status of this table entry. 
             When the status is active : 
             (1) In the situation that the specified transfer operation by 
             ftp/tftp is in progress, the transfer operation will be aborted 
             if the status is set to notInService. 
             (2) In any other situations, the specified operation will not be 
             aborted even if the status is set to notInService. "                      �"This object specifies the SFTP/FTP server port that is used for file transfer 
             only if the value of hwCfgOperateProtocol is sftp/ftp.  
             The default SFTP server port is 22 if no port is specified. 
             The default FTP server port is 21 if no port is specified.  
             If the value of hwCfgOperateProtocol is not sftp/ftp, this object is ignored by the 
             implementation. "                      ="The source IP address. When the operation type is running2Net,
        net2Running, net2Startup or startup2net, the source IP address 
        of the client may be specified or not. Default is 0.0.0.0 .
        If the source type is set to both of IP address and interface, 
        the former has the priority."                      2"The name of the interface.When the operation type is running2Net,
        net2Running,net2Startup or startup2net, the source interface 
        of the FTP/TFTP client may be specified or not. If the source 
        type is set to both of IP address and interface,the former has 
        the priority."                      �"This object specifies the action when a configuration command fails to be executed.
         continueOnError: skips the failed configuration command and continues to run other configuration commands.
         stopOnError: stops running the failed configuration command and does not run other configuration commands.
         rollbackOnError: rolls back the configuration to that before the configuration file is executed."                       �"The ip address type of the FTP/TFTP/SFTP server from/to which to download/upload must be specified. 1 is used for ipv4, 2 is used for ipv6."                       g"Address or host name of the FTP/TFTP/SFTP server from/to which to download/upload must be specified. "                       @"The VPN instance name that through which to transfer the file."                       ."A table of config-operation requests result."                       9"The result entries of configuration operation requests."                      "
            The index of Table, which is an incremental integer.
            The maximum value of the node is 2147483647.The agent should wrap the
            value to 1 and flush all the existing entries when the maximum value
            is reached."                       /"The operation index in the hwCfgOperateTable."                       ."The operation type in the hwCfgOperateTable."                      "The status of the specified operation.
            
            opInProgress : 
                specified operation is active
            
            opOperationSuccess : 
                specified operation is supported and
                completed successfully
            
            opInvalidOperation : 
                command invalid or command/protocol/device 
                combination unsupported
            
            opInvalidProtocol :
                invalid protocol specified
            
            opInvalidSourceName :
                invalid source file name specified.
                
            
            opInvalidDestName :
                invalid target name  specified.
                
            
            opInvalidServerAddress :
                invalid server address specified
            
            opDeviceBusy :
                specified device is in use and locked by 
                another process
            
            opDeviceOpenError :
                invalid device name
            
            opDeviceError :
                device read, write or erase error
            
            opDeviceNotProgrammable :
                device is read-only but a write or erase 
                operation was specified
            
            opDeviceFull :
                device is filled to capacity
            
            opFileOpenError :
                invalid file name; file not found in partition
            
            opFileTransferError :
                file transfer was unsuccessfull; network failure
            
            opFileChecksumError :
                file checksum in Flash failed
            
            opNoMemory :
                system running low on memory
            
            opAuthFail:
                invalid user name or password
                
            opTimeOut :
                file transfer was timeout
            
            opUnknownFailure :
                failure unknown
            
            opAbort :
                transfer operation has been aborted

            opInvalidSourceAdress :
                invalid source address specified.

            opInvalidSourceInterface :
                invalid source interface specified.   
            
            opCmdExecuteFail :
                execute command return error.    

            opWaitFileTrans :
                device is ready, wait nms file transfer. 

            opLockStartUp :
                the next startup file is locked by another user.  

            opSetStartupFileFail :
                set startup file fail. 

            opGetStartupFileFailInMiniSystem :
                get next startup file fail in mini-system mode. 
                "                       �"Records the time taken for the operation. This object will
            be like a stopwatch, starting when the operation
            starts, and stopping when the operation completes."                       F"The value of sysUpTime when the configuration operation is finished."                      ?"This object indicates progress of file transfer in the hwCfgOperateTable. 
             When hwCfgOperateProtocol is specified as 2(tftp) or 3(sftp), and hwCfgOperateType is specified as net2Running or net2Startup, 
             this object will be set as 65535, which indicates the progress can not be calculated. "                       0"The failure reason of configuration operation."                       $"Table on changes of configuration."                       5"Time entity on changes of the configuration module."                       �"Module index. It is an integer without enumeration. This is because the enumeration may expose the classification methods of modules. In addition, this field is uncertain in the beginning stage and once the value is determined, it cannot be modified."                        "Time on changes of the module."                       $"compare configuration of the files"                      �"ErrorCode: cause of an alarm. (1: Failed to restore some configurations. 2: Failed to restore all configurations because of a failure to open the configuration file. 3: Failed to restore all configurations because of the nonexistent configuration file. 4: Failed to restore all configurations because of the nonexistent configuration file. 5: Failed to restore all configurations because of other reasons.)"                           �"The object records the interval minute of saving configuration automatically.
the function of saving configuration automatically is disable when the interval is zero, else it is enable(the default is 30 minutes). "           --metric: minute
           �"The object records the latest date and time when the current 
            configurations were saved automatically in the system."                       ~"The object records the latest date and time when the current 
            configurations were saved manually in the system."                       �"This object indicates the upper limit of the CPU usage when configurations are  
             automatically saved. If the function of saving configuration automatically is not 
             enabled, the value is insignificant. Default value is 50."           --metric: %
           �"This object indicates the interval from the time configurations are automatically 
             saved to now.If the function of saving configuration automatically is not enabled, 
             the value is insignificant. Default value is 30."           --metric: minute
          "This object indicates the delay minute after some configurations change happens 
            then configurations are automatically saved. If the function of saving configuration 
            automatically is not enabled, the value is insignificant. Default value is 5."           --metric: minute
           5"A table of config-operation requests.
            "                       "An operate request entry."                       0"The unique index value of a row in this table."                       �"The ip address of the FTP/TFTP/SFTP server to 
            which to the device backup configuration automatically.  
            Values of 0.0.0.0 or FF.FF.FF.FF are not permitted."                       D"The protocol used to backup configuration to server automatically."                       8"The length of the user name should range from 1 to 64."                      �"The password can be plain text or encripted text.
             If the password is plain text, its length should range from 0 to 255.
             If the password is in cipher text, its length is 24 or from 32 to 392.
             When get the value of the field, the device will return a zero-length string.
             When set the field, its value cannot be a string that contains no character."                       H"The length of the path in the backup server should range from 1 to 64."                       !"The status of this table entry."                       \"This object is only for trap information, and does not support get and get-next operation."                       @"The VPN instance name that through which to transfer the file."                       \"The port number of the server  to which to the device backup configuration automatically. "                       4"The address type of the hwCfgBackupServerIp entry."                           �"Config data unit lock/unlock controller,if set active(2),the lock will be locked if no one locked it before.
            if set inactive(1),the lock will be unlocked if the currunt user locked it before.
            "                       0"Table on users of configuration lock or level."                       <"Users entity on lock or level of the configuration module."                       W"SessionID of users who have the configuration level or have locked the configuration."                       Y"Description of users who have the configuration level or have locked the configuration."                       V"UserName of users who have the configuration level or have locked the configuration."                       W"LoginTime of users who have the configuration level or have locked the configuration."                       X"IP Address of users who have the configuration level or have locked the configuration."                       g"The last configurate Time of users who have the configuration level or have locked the configuration."                       A"Unlock without configuration seconds, 1-7200, the default is 30"                           -"Name of a user who locks the configuration."                       /"Name of a user who unlocks the configuration."                       $"Unique ID of a configuration lock."                       ("Time when the configuration is locked."                       *"Time when the configuration is unlocked."                       "Whether an internal change."                       9"Name of the user who triggers the configuration change."                       <"ID of the session that initiates the configuration change."                       9"Source address that initiates the configuration change."                       F"Type of the storage warehouse where the configuration change occurs."                       >"Type of the terminal that initiates the configuration change"                       E"Type of the startup configuration file whose integrity check fails."                           S"If the system configuration is changed,
            a notification is generated."                 ^"When a configuration operation has been done, a 
            notification may be generated."                 �"When the system automatically detects 
            that configurations of the AMB and the SMB are inconsistent, 
            the trap is generated."                 �"When the system automatically detects 
            that configurations of the AMB and the SMB change 
            from inconsistent to consistent, 
            the trap is generated."                 �"When the system failed to backup current configuration to
            specified server, this trap will generate to indicates the
            details information."                 i"When the system begin to backup current configuration to
            servers, this trap will generate."                 ?"When configuration restoration fails, this trap is generated."                 B"When configuration restoration succeeds, this trap is generated."                 �"When system automatically detects that configurations of the main board and the slave board are inconsistent, this trap is generated."                 �"When system automatically detects that configurations of the main board and the slave board change from inconsistent to consistent, this trap is generated."                 �"When the system automatically detects 
            that configurations of the application and the Master Main Board are inconsistent, 
            the trap is generated."                 �"When the system automatically detects 
            that configurations of the application and the Master Main Board  change 
            from inconsistent to consistent, 
            the trap is generated."                 �"When the system automatically detects that the next startup files of the master and slave main control boards are inconsistent, this trap is generated."                 �"When the system automatically detects that the next startup files of the master and slave main control boards become consistent, this trap is generated."                 @"The trap is generated when a user locks system configurations."                 B"The trap is generated when a user unlocks system configurations."                 5"The trap is generated when a configuration changes."                 ["The trap is generated when system memory is not enough to complete configuration editing."                 Z"The trap is generated when the hwCfgMemoryInsufficient trap is manually cleared by user."                 b"The trap is generated when the integrity check of the the next startup configuration file fails."                 Y"The trap is generated when the integrity check of the startup configuration file fails."                 `"The trap is generated when the hwcfgStartupFileIntegrityFail trap is manually cleared by user."                 U"The trap is generated when the system restores to the minimum system configuration."                 h"The trap is generated when the system does not restore the system to the minimum system configuration."                         i"The compliance statement for entities implementing
            the Huawei Configuration Management MIB"   s"The compliance statement for entities implementing
                     the Huawei Configuration Management MIB."                 2"A collection of objects configuration log group."                 %"A group of configuration operation."                 %"Collection of notification objects."                     %"A group of configuration operation."                