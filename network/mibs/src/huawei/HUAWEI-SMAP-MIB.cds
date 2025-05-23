�-- =================================================================
--  Copyright (C) 2003 by  HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: HUAWEI-SMAP-MIB, this mib will maintain the SMAP
--              mib oid for all datacomm product. 
-- Reference:
-- Version:     V1.0
-- History:
--              yangyinzhu,2003-03-18, initial version.
--              chenruining,2003-03-20, adjust to the SRS review.
-- =================================================================
                     Z"
            V1.00
            The SMAP mib is for all datacomm product.
            "5"
            R&D BeiJing, Huawei Technologies co.,Ltd.
            Huawei Bld.,NO.3 Xinxi Rd.,
            Shang-Di Information Industry Base,
            Hai-Dian District Beijing P.R. China
            Zip:100085
            Http://www.huawei.com
            E-mail:support@huawei.com
            "        -- March 20, 2003 at 11:50 GMT
           ="
            The Port-Application Map table.
            "                       D"
            The Port-Application Map table struct.
            "                       \"
            The new port defined by user.
            
            This item is index."                       �"
            The SMAP function is used for which data flow.
            0 means thie item is used for all data flow.
            
            This item is index.
            "                       �"
            The application port defined by rfc. 
            
            Now only support:
            ftp    21
            smtp   25
            http   80
            rtsp   554
            h323   1720
            "                       C"
            Only support CreateAndGo and Destroy.
            "                               4"
            The SMAP table member.
            "                            