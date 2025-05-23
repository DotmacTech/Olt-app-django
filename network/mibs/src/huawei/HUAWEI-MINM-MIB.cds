�--  =================================================================================
-- Copyright (C) 2006 by HUAWEI TECHNOLOGIES. All rights reserved
-- 
-- Description: This mib file is used for configuration of MINM 
--              information.
-- Reference:
-- Version:     V1.0
-- History:
--              V1.0 wuchunqiang 60020627, 2006.10.30, publish
--                   pengpeng    60021576,2006.10.30 
--                   yuwei       43165,   2006.11.15                                                                  
--                   xiebojie   60021221 ,2007.05.22       
--                     zhangyinjuan 64060,  2008.06.18
-- =================================================================================
   t"Indicates the administration status as follows:
                up(1),
                down(2)
                "              	A"This TC describes the format of a port identifier string.
            Objects of this type are always used with an associated
            LldpPortIdSubtype object, which identifies the format of the
            particular LldpPortId object instance.

            If the associated LldpPortIdSubtype object has a value of
            'interfaceAlias(1)', then the octet string identifies a
            particular instance of the ifAlias object (defined in IETF
            RFC 2863).  If the particular ifAlias object does not contain
            any values, another port identifier type should be used.

            If the associated LldpPortIdSubtype object has a value of
            'portComponent(2)', then the octet string identifies a
            particular instance of the entPhysicalAlias object (defined
            in IETF RFC 2737) for a port or backplane component.

            If the associated LldpPortIdSubtype object has a value of
            'macAddress(3)', then this string identifies a particular
            unicast source address (encoded in network byte order
            and IEEE 802.3 canonical bit order) associated with the port
            (IEEE Std 802-2001).

            If the associated LldpPortIdSubtype object has a value of
            'networkAddress(4)', then this string identifies a network
            address associated with the port.  The first octet contains
            the IANA AddressFamilyNumbers enumeration value for the
            specific address type, and octets 2 through N contain the
            networkAddress address value in network byte order.

            If the associated LldpPortIdSubtype object has a value of
            'interfaceName(5)', then the octet string identifies a
            particular instance of the ifName object (defined in IETF
            RFC 2863).  If the particular ifName object does not contain
            any values, another port identifier type should be used.

            If the associated LldpPortIdSubtype object has a value of
            'agentCircuitId(6)', then this string identifies a agent-local
            identifier of the circuit (defined in RFC 3046).

            If the associated LldpPortIdSubtype object has a value of
            'local(7)', then this string identifies a locally
            assigned port ID."               �" 
                Indicates the type of the static MAC forwarding table of a service instance:
                static(1): indicates a static entry.
                blackhole(2): indicates a blackhole entry.
                "               �"Indicates the processing behavior of packets as follows:
                discard(1),
                forward(2)
                "              2"Indicates the type of a service instance as follows:
                p2p(1): indicates the type of a point-to-point service instance.
                mp2mp(2): indicates the type of a multi-point to multi-point service instance.
                By default, the service type is mp2mp.
                "              �"  Indicates the time interval for fast sending of Aps packets described in the G.8031. 
                By default, it is 3.3 ms.
                Optional values for sending interval are as follows:
                apsInterval3dot3ms(1): indicates a sending interval of 3.3 ms.
                apsInterval5ms(2): indicates a sending interval of 5 ms.
                apsInterval10ms(3): indicates a sending interval of 10 ms.
                apsInterval15ms(4): indicates a sending interval of 15 ms.
                apsInterval20ms(5): indicates a sending interval of 20 ms.
                apsInterval30ms(6): indicates a sending interval of 30 ms.
                "             ;"802.1ag clauses 12.14.7.5.3 o), 21.9.10.1 and Table 21-28" 5"Possible values returned in the egress action field"            �"802.1ag clauses 12.14.7.5.3 g), 20.32.2.5, and Table 21-24.
                RlyHit(1) The LTM reached an MP whose MAC address matches the target MAC address. 
                RlyFDB(2) The Egress Port was determined by consulting the Filtering Database(20.41.1.1:a).
                RlyMPDB(3) The Egress Port was determined by consulting the MIP CCM Database(20.41.1.1:b).
                " @"Indicates the possible values the Relay action field can take."              �"Indicates the protection modes of the G.8031 Aps protection group of mac-tunnels.
                oneplusonebidirectional(1): 1 + 1 switchover protection modes on both ends
                oneplusoneunidirectional(2): 1 + 1 switchover protection modes on a single end
                onetoone(3): 1:1 protection mode
                By the default, the 1:1 protection mode is used.
                
                "               o"Indicates the operation status as follows:
                up(1),
                down(2)
                "              _"Indicates the protection protocol of the protection group of mac-tunnels.
                protocolAps(1): use an APS protocol to enhance the protection switching.
                protocolOam(2): not using any APS protocol to enhance the protection switching.
                By the default, the Protocol OAM is used.            
                "              "Indicates the switchover commands for the Aps protection group of mac-tunnels.
                The priority levels in a descending order are: clear, lock, force and manual.
                clear(1): clears the lock, force and manual commands, and WTR state on the local end. 
                After the local commands are cleared, the WTR state cannot be entered.
                lock(2): locks the services on the working tunnel.
                force(3): forcibly switches the services to the protection tunnel when the protection tunnel is in sound state.
                manual(4): forcibly switches the services to the protection channel when the working and the protection tunnel are in sound state. 
                null(5):there is not manual commands.
                "              4"Indicates the interval at which CCMs are sent by a MEP.
                The possible values are:
                intervalInvalid(1) No CCMs are sent (disabled).
                interval300Hz(2)   CCMs are sent every 3 1/3 milliseconds
                                   (300Hz).
                interval10ms(3)    CCMs are sent every 10 milliseconds.
                interval100ms(4)   CCMs are sent every 100 milliseconds.
                interval1s(5)      CCMs are sent every 1 second.
                interval10s(6)     CCMs are sent every 10 seconds.
                interval1min(7)    CCMs are sent every minute.
                interval10min(8)   CCMs are sent every 10 minutes.
                interval20ms(9)    CCMs are sent every 10 milliseconds.
                interval30ms(10)    CCMs are sent every 10 milliseconds.
                interval50ms(11)   CCMs are sent every 10 milliseconds.
                
                Note: enumerations start at zero to match the 'CCM Interval
                      field' protocol field.
                "             l"802.1ag clauses 12.14.7.5.3 k), 21.9.9.1, 20.35.2.6 and
                 Table 21-26.
                  " 7"Possible values returned in the ingress action field."              
�"This TC describes the format of a chassis identifier string.
            Objects of this type are always used with an associated
            LldpChassisIdSubtype object, which identifies the format of
            the particular LldpChassisId object instance.

            If the associated LldpChassisIdSubtype object has a value of
            'chassisComponent(1)', then the octet string identifies
            a particular instance of the entPhysicalAlias object
            (defined in IETF RFC 2737) for a chassis component (i.e.,
            an entPhysicalClass value of 'chassis(3)').

            If the associated LldpChassisIdSubtype object has a value
            of 'interfaceAlias(2)', then the octet string identifies
            a particular instance of the ifAlias object (defined in
            IETF RFC 2863) for an interface on the containing chassis.
            If the particular ifAlias object does not contain any values,
            another chassis identifier type should be used.

            If the associated LldpChassisIdSubtype object has a value
            of 'portComponent(3)', then the octet string identifies a
            particular instance of the entPhysicalAlias object (defined
            in IETF RFC 2737) for a port or backplane component within
            the containing chassis.

            If the associated LldpChassisIdSubtype object has a value of
            'macAddress(4)', then this string identifies a particular
            unicast source address (encoded in network byte order and
            IEEE 802.3 canonical bit order), of a port on the containing
            chassis as defined in IEEE Std 802-2001.

            If the associated LldpChassisIdSubtype object has a value of
            'networkAddress(5)', then this string identifies a particular
            network address, encoded in network byte order, associated
            with one or more ports on the containing chassis.  The first
            octet contains the IANA Address Family Numbers enumeration
            value for the specific address type, and octets 2 through
            N contain the network address value in network byte order.

            If the associated LldpChassisIdSubtype object has a value
            of 'interfaceName(6)', then the octet string identifies
            a particular instance of the ifName object (defined in
            IETF RFC 2863) for an interface on the containing chassis.
            If the particular ifName object does not contain any values,
            another chassis identifier type should be used.

            If the associated LldpChassisIdSubtype object has a value of
            'local(7)', then this string identifies a locally assigned
            Chassis ID."              �"Indicates the interface type of a service instance. 
                The encApsulation mapping modes of the service instance can be configured as follows:
                transparent(1): indicates the transparent transmission mode.
                oneToOne(2): indicates the one-to-one in the s-tagged mode.
                bundling(3): indicates the bundling in the s-tagged mode.
                By default, the s-tagged bundling mode is used.
                
                "              �"This TC describes the source of a chassis identifier.

            The enumeration 'chassisComponent(1)' represents a chassis
            identifier based on the value of entPhysicalAlias object
            (defined in IETF RFC 2737) for a chassis component (i.e.,
            an entPhysicalClass value of 'chassis(3)').

            The enumeration 'interfaceAlias(2)' represents a chassis
            identifier based on the value of ifAlias object (defined in
            IETF RFC 2863) for an interface on the containing chassis.

            The enumeration 'portComponent(3)' represents a chassis
            identifier based on the value of entPhysicalAlias object
            (defined in IETF RFC 2737) for a port or backplane
            component (i.e., entPhysicalClass value of 'port(10)' or
            'backplane(4)'), within the containing chassis.

            The enumeration 'macAddress(4)' represents a chassis
            identifier based on the value of a unicast source address
            (encoded in network byte order and IEEE 802.3 canonical bit
            order), of a port on the containing chassis as defined in
            IEEE Std 802-2001.

            The enumeration 'networkAddress(5)' represents a chassis
            identifier based on a network address, associated with
            a particular chassis.  The encoded address is actually
            composed of two fields.  The first field is a single octet,
            representing the IANA AddressFamilyNumbers value for the
            specific address type, and the second field is the network
            address value.

            The enumeration 'interfaceName(6)' represents a chassis
            identifier based on the value of ifName object (defined in
            IETF RFC 2863) for an interface on the containing chassis.

            The enumeration 'local(7)' represents a chassis identifier
            based on a locally defined value."              8"The value of a management address associated with the LLDP
            agent that may be used to reach higher layer entities to
            assist discovery by network management.

            It should be noted that appropriate security credentials,
            such as SNMP engineId, may be required to access the LLDP
            agent using a management address.  These necessary credentials
            should be known by the network management and the objects
            associated with the credentials are not included in the
            LLDP agent."             "IEEE 802.1AB-2005 9.5.9.5"�"This TC describes the basis of a particular type of
            interface associated with the management address.

            The enumeration 'unknown(1)' represents the case where the
            interface is not known.

            The enumeration 'ifIndex(2)' represents interface identifier
            based on the ifIndex MIB object.

            The enumeration 'systemPortNumber(3)' represents interface
            identifier based on the system port numbering convention."              w"Indicates the Maintenance association End Point Identifier (MEPID): A small
                integer, unique over a given Maintenance Association,
                identifying a specific MEP.
                
                The special value 0 is allowed to indicate special cases, for
                example that no MEPID is configured in a given Maintenance
                Association point.
                
                Whenever an object is defined with this SYNTAX, then the
                DESCRIPTION clause of such an object MUST specify what the
                special value of 0 means.
                "              I"This TC describes the source of a particular type of port
            identifier used in the LLDP MIB.

            The enumeration 'interfaceAlias(1)' represents a port
            identifier based on the ifAlias MIB object, defined in IETF
            RFC 2863.

            The enumeration 'portComponent(2)' represents a port
            identifier based on the value of entPhysicalAlias (defined in
            IETF RFC 2737) for a port component (i.e., entPhysicalClass
            value of 'port(10)'), within the containing chassis.

            The enumeration 'macAddress(3)' represents a port identifier
            based on a unicast source address (encoded in network
            byte order and IEEE 802.3 canonical bit order), which has
            been detected by the agent and associated with a particular
            port (IEEE Std 802-2001).

            The enumeration 'networkAddress(4)' represents a port
            identifier based on a network address, detected by the agent
            and associated with a particular port.

            The enumeration 'interfaceName(5)' represents a port
            identifier based on the ifName MIB object, defined in IETF
            RFC 2863.

            The enumeration 'agentCircuitId(6)' represents a port
            identifier based on the agent-local identifier of the circuit
            (defined in RFC 3046), detected by the agent and associated
            with a particular port.

            The enumeration 'local(7)' represents a port identifier
            based on a value locally assigned."                                                                                     �"The HUAWEI-MINM-MIB contains objects to 
                Manage configuration for MINM feature.
                                                
                "\"R&D Beijing, Huawei Technologies Co., Ltd.
                Huawei Bld., NO.3 Xinxi Rd, 
                Shang-Di Information Industry Base,
                Hai-Dian District Beijing P.R. China
                Zip: 100085 
                Http://www.huawei.com                                       
                E-mail:support@huawei.com"       #-- November 23, 2006 at 00:00 GMT
               q"Indicates the virtual MAC address of the device. 
                By default, there is no virtual MAC address."                       W"Indicates the starting value of the backbone VLAN that is assigned to the mac-tunnel."                       U"Indicates the ending value of the backbone VLAN that is assigned to the mac-tunnel."                       \"Indicates that the Snmp-Agent Trap is enabled on the Mac-in-Mac.By default, it is disable."                               @"Indicates the Index of the Next Mac Tunnel.It begins with one."                       <"Indicates a configuration information table of Mac-tunnel."                       J"Indicates the entry in the tunnel configuration table of the mac-tunnel."                       8"Indicates the index of Mac Tunnel. It begins with one."                       �"Indicates the name of the mac-tunnel. 
                It is a character string with a maximum of 31 bytes and a minimum of 1 byte."                       {"Indicates the remote MAC address of the current mac-tunnel. 
                By default, there is no such configuration."                      i"Indicates BVLAN value of the current BVLAN used by the mac-tunnel: It ranges from 1 to 4094. By default, BVLAN value is not configured.
                The VLAN here must have been created and be in the backbone VLAN used by the mac-tunnel. 
                The special value of zero is used to indicate that no VLAN-ID is present or used.
                "                       s"               
                Indicates the B-TAG type of the BVLAN. By default, it is 88a8.
                "                      ="Indicates priority level of the mac-tunnel. 
                It is used to set the priority field of B-TAG.
                There are eight priority levels. By default, the I-TAG priority is used.
                The special value of eight is used to indicate that priority was unknown or none.
                "                       �"Indicates the port used in the mac-tunnel. By default, it is not configured.
                The value zero is used to indicate that interface was unknown or none."                       �"Indicates the split horizon of tunnels. By default, it is enabled.
                When split horizon is enabled on two mac-tunnels, the two tunnels cannot exchange packets.
                "                       8"Indicates the administration status of the mac-tunnel."                       1"Indicates the physical state of the mac-tunnel."                       �"Indicates descriptive information of the static Mac-In-Mac tunnel. 
                Its length ranges from 1 to 80 bytes and the first byte cannot be a space.
                "                       >"Indicates the reset on traffic statistics of the mac-tunnel."                       �"Indicates that the I-TAG priority is copied to the mac-tunnel. 
                By default, the I-TAG priority is not copied to the mac-tunnel."                       �"Indicates that the I-DEI priority is copied to the mac-tunnel. 
                By default, the I-DEI priority is not copied to the mac-tunnel."                      �"Indicates DEI of the mac-tunnel. It is used to set the DEI field of B-TAG. 
                When DEI is true, the value is set to 1. 
                When DEI is false, the value is set to 0. 
                By default, the I-DEI priority is not copied to the mac-tunnel, and the DEI is false. 
                When the value of the DEI is set to 2, it indicates that no DEI 
                is configured on the tunnel. "                       o"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy"                       K"Indicates a query for the hwMinMMacTnlStatisticsTable of the mac-tunnel. "                       Q"Indicates an entry query for the hwMinMMacTnlStatisticsTable of the mac-tunnel."                       >"Indicates the number of packets received by the mac-tunnel. "                       ;"Indicates the number of bytes received by the mac-tunnel."                       :"Indicates the number of packets sent by the mac-tunnel. "                       7"Indicates the number of bytes sent by the mac-tunnel."                       B"Indicates the mapping table of the tunnel name and tunnel index."                       H"Indicates the mapping table entry of the tunnel name and tunnel index."                       �"Indicates the name of the mac-tunnel. 
                It is a character string with a maximum of 31 bytes and a minimum of 1 byte. "                       0"Indicates the tunnel index.It begins with one."                           I"Indicates the parameters used to describe CC packets.
                "                       "Indicates the CC table entry."                        "Indicates that CFM is enabled."                       ,"Indicates the time interval of CC packets."                       ."Indicates a connectivity failure of tunnels."                       C"Indicates whether the RDI packet from the remote end is received."                       ""Whether CC reception is enabled."                       "Indicates the row status."                       7"Indicates the parameters used to describe Lb packets."                       %"Indicates the loopback table entry."                       _"
                Indicates that the MAC Ping is started inside the tunnel.
                "                       "Indicates the operation time."                       P"Indicates the timeout period entered by a user, in ms. By default, it is 2000."                       Y"
                Indicates the number of times that Ping is entered.
                "                       J"
                Indicates the size of an Lbm packet.
                "                       5"Indicates the number of valid LBR packets received "                       Z"
                Whether the MAC ping operation for a tunnel is over.
                "                       "Indicates the row status."                       r" 
                Performance statistics returned by using the MAC ping command for a tunnel.
                "                       %"Indicates the loopback table entry."                       B"
                The minimum round trip time.
                "                       B"
                The maximum round trip time.
                "                       B"
                The average round trip time.
                "                       <"
                The packet loss ratio.
                "                       9"Indicates the parameters used to describe Ltm packets. "                       &"Indicates the linktrace table entry."                       a"
                Indicates that the MAC Trace is started inside the tunnel. 
                "                       g"
                The time stamp for enabling the MAC trace operation for a tunnel.
                "                       t"
                Indicates the timeout period entered by a user, in ms. By default, it is 2000.
                "                       P"
                Indicates the living cycle of Ltm packets.
                "                       G"
                The flags field of an LTM packet.
                "                       C"
            The sequence number of an LTM packet.
            "                       )"Indicates the egress ID of Ltm packets."                      $"
                Two conditions are used to determine whether the MAC trace operation to a tunnel is over: (1) The peer of a tunnel has been traced. (2) The preset timer for timeout is triggered.
                Either condition indicates the completion of an operation.
                "                       "Indicates the row status."                       9"Indicates the parameters used to describe Ltr packets. "                       ="
                Indicates the linktraceRelay table entry."                       j"
                       Indicates the parameters used to describe Ltr packets.
                       "                       �"An index to distinguish among multiple LTRs with the same LTR
                        Transaction Identifier field value.
                       " "802.1ag clause 12.14.7.5.2"                     %"TTL field value for a returned LTR."                       �"
                Indicates an identifier that shows whether the LTM packet should be forwarded to the next hop.    
                "                      l"LTR packet is a response packet to a LTM packet. 
                The LTM packet is the last packet sent by a port on a device. 
                This variable indicates the port identifier of the LTM packet. 
                The last six bytes indicate the MAC address, and the first two bytes represent the board number and outbound port number respectively."                      ""If the LTM packet needs to be forwarded to the next hop, the port identifier of the next hop should be added to the TVL field in the response LTR packet. The last six bytes indicate the MAC address, and the first two bytes represent the board number and outbound port number respectively."                       0"Indicates the value in the Relay Action field."                       <"The value returned in the Ingress Action Field of the LTM."                       8"MAC address returned in the ingress MAC address field."                        "Format of the Ingress Port ID."                       �"Ingress Port ID. The format of this object is determined by
                        the value of the dot1agCfmLtrIngressPortIdSubtype object.
                       "                       ;"The value returned in the Egress Action Field of the LTM."                       7"MAC address returned in the egress MAC address field."                       "Format of the egress Port ID."                       �"Egress Port ID. The format of this object is determined by
                        the value of the dot1agCfmLtrEgressPortIdSubtype object.
                       "                           M"Indicates the configuration table for the Aps protection of the mac-tunnel."                       T"Indicates the configuration table entry for the Aps protection of the mac-tunnel. "                       >"Indicates the index of ProtectMacTunnel. It begins with one."                       9"Indicates the tunnel name of the protective mac-tunnel."                       @"Indicates the remote MAC address of the protecting mac-tunnel."                       T"Indicates BVLAN value used by the protecting mac-tunnel: It ranges from 1 to 4094."                      �"Indicates the protection modes of the G.8031 Aps protection group of mac-tunnels.
                oneplusonebidirectional(1): 1 + 1 switchover protection modes on both ends
                oneplusoneunidirectional(2): 1 + 1 switchover protection modes on a single end
                onetoone(3): 1:1 protection mode
                By the default, the 1:1 protection mode is used.
                "                       �"Indicates that the G.8031 protocol of Aps protection group in the mac-tunnel is enabled. 
                By default, the protocol is disabled.
                "                      7"  Indicates the configuration of fast sending time interval for each protection group.
                The time intervals for fast sending of Aps packets described in the G.8031 are as follows:
                By default, the time interval for fast sending of Aps packets in G.8031 is 3.3 ms.
                Optional values for sending interval are as follows:
                ApsInterval3dot3ms(1): indicates a sending interval of 3.3 ms.
                ApsInterval5ms(3): indicates a sending interval of 5 ms.
                ApsInterval10ms(3): indicates a sending interval of 10 ms.
                ApsInterval5ms(4): indicates a sending interval of 15 ms.
                ApsInterval20ms(5): indicates a sending interval of 20 ms.
                ApsInterval30ms(6): indicates a sending interval of 30 ms."                      "Indicates the switchover restoration time of Aps protection groups in the mac-tunnel, in 100 ms. 
                It ranges from 0 to 100.
                By default, the switchover restoration time is not delayed. The value of delay is zero.
                "                       b"Indicates the non-restoration protection switchover mode of Aps protection group in mac-tunnels."                       �"Indicates the restoration time of restoration protection switchover mode of Aps protection group in mac-tunnels.
                By default, the switchover mode is restoration. The restoration time is five minutes."                       "Indicates the switchover commands for the Aps protection group of mac-tunnels.
                The priority levels in a descending order are: clear, lock, force and manual.
                clear(1): clears the lock, force and manual commands, and WTR state on the local end. 
                After the local commands are cleared, the WTR state cannot be entered.
                lock(2): locks the services on the working tunnel.
                force(3): forcibly switches the services to the protection tunnel when the protection tunnel is in sound state.
                manual(4): forcibly switches the services to the protection channel when the working and the protection tunnel are in sound state. 
                null(5):there is not manual commands."                      ^"Indicates the protection protocol of the protection group of mac-tunnels.
                ProtocolAPS(1): use an APS protocol to enhance the protection switching.
                ProtocolOAM(2): not using any APS protocol to enhance the protection switching.
                By the default, the ProtocolOAM is used.            
                "                       o"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy"                           G"Indicates the index of the next Service Instance. It begins with one."                       :"Indicates the configuration table of a service instance."                       @"Indicates the configuration table entry of a service instance."                       ="Indicates the Index of Service Instance.It begins with one."                       �"Indicates the ID of a service instance. It can be any value within 24 bits. 
                By default, the value is null.
                One ID can be configured to one service instance only.
                "                       �"Indicates the name of a service instance. 
                It is a character string with a maximum of 31 bytes and a minimum of 1 byte. 
                "                      ,"Indicates the type of a service instance as follows:
                p2p: indicates the type of a point-to-point service instance.
                mp2mp: indicates the type of a multi-point to multi-point service instance.
                By default, the service type is mp2mp.
                "                       �"Indicates that the priority of user packet based on 802.1Q is trusted. 
                By default, no user priority is trusted.
                "                      <"Indicates priority level of a service instance. 
                 It is used to set the priority field of I-TAG.
                 By default, no user priority is trusted and the priority is zero.
                 The special value of eight is used to indicate that priority of user is trusted.
                "                      y"Indicates the interface type of a service instance.
                transparent: indicates the transparent transmission mode.
                one-to-one: indicates the one-to-one in the s-tagged mode.
                bundling: indicates the bundling in the s-tagged mode.
                By default, the s-tagged bundling mode is used.
                
                "                       <"Indicates the administration status of a service instance."                       6"Indicates the physical status of a service instance."                       �"Disable the MAC learning of a service instance. By default, the MAC learning is enabled.
                This object applies to the service instance of mp2mp only. 
                It is invalid in the service type of p2p.
                "                      �"Indicates MAC learning restriction of a service instance.
                After the number of MAC address entries reaches the limit, the system takes the following actions:
                discard: indicates that packets with new MAC address are discarded.
                forward: indicates that packets with new MAC address are forwarded, but the address is not added to the MAC address table.
                "                      ="Indicates MAC learning restriction of a service instance.
                Indicates whether alarm should be sent after the number of MAC address entries reaches the limit as follows:
                disable: indicates no alarm is sent.
                enable: indicates alarm is sent in syslog.
                "                      ,"Indicates MAC learning restriction of a service instance.
                The number of MAC addresses that can be learnt by the current service instance ranges from 0 to 131072.
                When the number is set to zero, no restriction is imposed on the address learning.  
                "                      p"This configuration is unsuitable for the case of port+vlan+cos mapping. Layer 2 control packets of a service instance are handled as follows: By default, all layer 2 control packets are transmitted transparently and all bits are 0; if a bit is 1, it indicates that the packets of this protocol will be discarded.
                 If bit 0 is 1, it indicates that all layer 2 control packets will be discarded.
                 If bit 1 is 1, it indicates that the STP packets will be discarded.
                 If bit 2 is 1, it indicates that the LLAP packets will be discarded.
                 If bit 3 is 1, it indicates that the LACP packets will be discarded.
                 If bit 4 is 1, it indicates that the DOT3AH packets will be discarded.
                 If bit 5 is 1, it indicates that the DOTLAG packets will be discarded.            
                "                      	"Indicates how a service instance processes an unknown unicast packet.
                By default, the service instance is allowed to broadcast the unknown unicast packet. 
                This object applies to the mp2mp service instance only.
                "                       �"Indicates how a service instance processes an unknown multicast packet.
                By default, the service instance is allowed to broadcast the unknown multicast packet. 
                This object applies to the mp2mp service instance only."                       �"Indicates how a service instance processes a broadcast packet.
                By default, the service instance is allowed to forward the broadcast packet. 
                This object applies to the mp2mp service instance only.
                 "                       �"Indicates descriptive information of a service instance. 
                Its length ranges from 1 to 80 bytes and the first byte cannot be a space.
                "                       I"Indicates that the traffic statistics is enabled on a service instance."                       B"Indicates the reset on traffic statistics of a service instance."                       p"The forwarded packets need to carry the CRC mark. By default, the forwarded packets do not carry the CRC mark."                      ."Indicates the source priority of a service instance.
                 It is used to set the I-TAG priority field when packets are 
                 encapsulated for transmission on the tunnel. 
                 The source priority has eight levels that range from 0 to 7. 
                 By default, the source priority is copied to the mac-tunnel. 
                 When the source priority is set to 8, 
                 it indicates that the service instance is not configured with a priority, 
                 and the priority does not exist."                      o"Indicates that the destination priority of a service 
                instance is copied from the B-TAG priority. 
                It is used to set whether the I-TAG priority is copied from the B-TAG 
                priority when packets reach the end of the tunnel and are decapsulated. 
                By default, the B-TAG priority is not copied to I-TAG."                      �"Indicates the source DEI of a service instance. 
                It is used to set the DEI field when packets are encapsulated for transmission 
                on the tunnel. When DEI is true, the value is set to 1. 
                When DEI is false, the value is set to 0. By default, 
                the S-DEI priority is copied to the mac-tunnel. 
                When the value of the DEI is set to 2, 
                it indicates that no DEI is configured on the tunnel."                      M"Indicates that the destination DEI of a service instance 
                is copied from the B-DEI priority. 
                It is used to set whether the DEI of I-TAG is coped from B-DEI 
                when packets reach the end of the tunnel and are decpasulated. 
                By default, B-DEI is not copied to I-TAG."                       �"Indicates that all the mapping users of a service instance are isolated. By default, the isolation is disabled. This object applies to the service instance of mp2mp only. It is invalid in the service type of p2p."                       o"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy"                       @"Indicates the configuration table of a service instance user. "                       F"Indicates the configuration table entry of a service instance user. "                       z"The port that is mapped to the current service instance. If the value is 0, it means that port mapping is not supported."                       �" The priority of a user's packets that are mapped to the current service instance. If the value is 8, it means that the priority mapping is not supported."                       �" The global VLAN ID that is mapped to the current service instance. If the value is 0, it means that the global VLAN mapping is not supported."                       C"Indicates the VLAN ID starting value of a service instance user. "                       A"Indicates the VLAN ID ending value of a service instance user. "                       �"Indicates that the specified mapping user of a service instance is isolated. By default, the isolation is enabled. This object applies to the service instance of mp2mp only. It is invalid in the service type of p2p"                       o"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy"                       ?"Indicates the mac-tunnel table bound with a service instance."                       E"Indicates the mac-tunnel table entry bound with a service instance."                       8"Indicates the index of Mac Tunnel. It begins with one."                       o"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy"                       ?"Indicates the hwMinMSIStatisticsTable of a service instance. "                       D"Indicates the hwMinMSIStatisticsTable entry of a service instance."                       U"Indicates the number of packets received by a user of the current service instance."                       S"Indicates the number of bytes received by a user of the current service instance."                       Q"Indicates the number of packets sent by a user of the current service instance."                       O"Indicates the number of bytes sent by a user of the current service instance."                       B"Indicates the static MAC forwarding table of a service instance:"                       H"Indicates the static MAC forwarding table entry of a service instance:"                       6"Indicates the destination MAC address of a customer."                       �" Indicates the name of the mac-tunnel. 
                It is a character string with a maximum of 31 bytes and a minimum of 1 byte. "                       u"Indicates a outbound port.
                 The value zero is used to indicate that interface was unknown or none."                       �"Indicates the downstream vlanid.
                 The special value of zero is used to indicate that no VLAN-ID is present or used. "                       �" Indicates the type of the static MAC forwarding table of a service instance:
                static(1): indicates a static entry.
                blackhole(2): indicates a blackhole entry. "                       p"Indicates the RowStatus. 
                The following three actions are used: active, createAndGo, destroy."                       G"Indicates the name and the index mapping table of a service instance."                       M"Indicates the name and the index mapping table entry of a service instance."                       �"Indicates the name of a service instance. 
                It is a character string with a maximum of 31 bytes and a minimum of 1 byte.
                "                       ?"Indicates the index of a service instance.It begins with one."                           �"Indicates the Up alarm of the mac-tunnel. 
                This object forms a pair with the following hwMinMMacTnlDown.
                "                 �"Indicates the Down alarm of the mac-tunnel. 
                This object forms a pair with the previous hwMinMMacTnlUp.
                "                 �"Indicates the Up alarm of a service instance. 
                This object forms a pair with the following hwMinMSIDown.
                "                 �"Indicates the Down alarm of a service instance. 
                This object forms a pair with the previous hwMinMSIUp.
                "                 D"Indicates an alarm on the connectivity of fault.
                "                >"Indicates the Aps protection group switchover alarm of the mac-tunnel. 
                This object forms a pair with the following hwMinMMacTnlRevertive.
                hwMinMMacTnlName: indicates the name of the primary tunnel.
                hwMinMMacTnlDMac: indicates the destination MAC address of the primary tunnel.
                hwMinMMacTnlBVlanID: indicates the BVLANID of the primary tunnel.
                hwMinMProtectMacTnlName: Indicates the name of the backup tunnel.
                hwMinMProtectSwitchOperation: Indicates the switchover commands for the Aps protection group of mac-tunnels.
                hwMinMProtectMacTnlBVlanID: indicates the BVLANID of the backup tunnel.
                hwMinMProtectMacTnlDMac:indicates the destination MAC address of the backup tunnel.
                "                >" 
                Indicates the Aps protection group switchover alarm of the mac-tunnel. 
                This object forms a pair with the previous hwMinMMacTnlSwitch.
                hwMinMMacTnlName: indicates the name of the primary tunnel.
                hwMinMMacTnlDMac: indicates the destination MAC address of the primary tunnel.
                hwMinMMacTnlBVlanID: indicates the BVLANID of the primary tunnel.
                hwMinMProtectMacTnlName: Indicates the name of the backup tunnel.
                hwMinMProtectSwitchOperation: Indicates the switchover commands for the Aps protection group of mac-tunnels.
                   hwMinMProtectMacTnlBVlanID: indicates the BVLANID of the backup tunnel.
                hwMinMProtectMacTnlDMac:indicates the destination MAC address of the backup tunnel."                 G"Indicates the  alarm of the mac limiting number beyond the Threshold."                         l"A collection of objects providing the System configuration of  the MAC-in-MAC
                capability."                 e"A collection of objects providing the configuration of  the MAC TUNNEL
                capability."                 g"A collection of objects providing the Statistics of the Service Instance
                capability."                 Z"A collection of objects providing the OAM of the MAC TUNNEL
                capability."                 Z"A collection of objects providing the Aps of the MAC TUNNEL
                capability."                 f"A collection of objects providing the configuration of Service Instance
                capability."                 g"A collection of objects providing the Statistics of the Service Instance
                capability."                 %"Collection of notification objects."                     Y"The compliance statement for entities implementing
                the Huawei MINM MIB"                          