--==================================================================
-- Copyright (C) 2017 by  HUAWEI TECHNOLOGIES. All rights reserved.
-- 
-- Description: HUAWEI VS MIB
-- Reference:
-- Version: V1.03
-- History:
-- <author>,  <date>,  <contents>
-- xuzhen   2011-6-17
-- ==================================================================
-- ==================================================================
-- 
-- Varibles and types are imported
--
-- ==================================================================
                     p"The HUAWEI-VS-MIB which contains objects manages virtual system name and virtual system id. 
                ""Huawei Industrial Base
                  Bantian, Longgang
                   Shenzhen 518129
                   People's Republic of China
                   Website: http://www.huawei.com
                   Email: support@huawei.com
                 " "201708171841Z" "201705181000Z" "201410211000Z" "Modify the description." i"HwVSEntry MIB objects hwVSStatus, hwVSCPUUsage, hwVSMemoryUsedSize, and hwVSMemoryTotalSize were added."  "Modify the Index of hwVSTable."                   0"Table about the id and name of virtual system."                       6"Information about the id and name of virtual system."                       c"This object indicates the index of a VS. The index is unique in the related physical system (PS)."                       �"This object indicates the name of the VS. The VS name must be unique in the entire system. It is a string of 1 to 31 characters."                      "The object specifies the virtual system state.
			    1. running(1): The virtual system is running.
			    2. stop(2): The virtual system is stopped.
			    3. restoring (3): The virtual system is being restored.
			    4. shutdowning(4): The virtual system is being stopped."                       <"This object specifies the CPU usage of the virtual system."                       J"This object specifies the size of the memory used by the virtual system."                       Q"This object specifies the total size of memory available to the virtual system."                               %"The virtual system attribute group."                     D"The compliance statement for systems supporting the HUAWEI-VS-MIB."              �"The single-node scalar table hwVSType contains only one field: hwVSType. This field indicates whether the current device supports VS. If the device does not support VS and a GET operation is performed, noSuchObject/noSuchInstance is returned. If the device supports VS and a GET operation is performed: hwVSType = 1, indicating that the device is an admin-VS device; hwVSType = 2, indicating that the device is a common VS device."                                  