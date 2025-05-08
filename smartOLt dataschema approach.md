---

\-- OLT Table

---

CREATE TABLE olt (
id SERIAL PRIMARY KEY,
name VARCHAR(255),
ip_address VARCHAR(100),
uptime VARCHAR(100),
env_temperature FLOAT,
location VARCHAR(255),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO olt (name, ip_address, uptime, env_temperature, location)
VALUES
('OLT-Alpha', '192.168.1.1', '5 days', 36.5, 'HQ Datacenter'),
('OLT-Beta', '192.168.1.2', '2 days', 33.1, 'Branch Office');

---

\-- Card Table

---

CREATE TABLE card (
id SERIAL PRIMARY KEY,
olt_id INTEGER REFERENCES olt(id),
slot_number INTEGER,
card_type VARCHAR(100),
status VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO card (olt_id, slot_number, card_type, status)
VALUES
(1, 1, 'PON-GPON', 'active'),
(1, 2, 'Uplink', 'inactive'),
(2, 1, 'PON-EPON', 'active');

---

\-- PON Port Table

---

CREATE TABLE pon_port (
id SERIAL PRIMARY KEY,
olt_id INTEGER REFERENCES olt(id),
port_number INTEGER,
status VARCHAR(50),
signal_strength FLOAT,
is_outage BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pon_port (olt_id, port_number, status, signal_strength, is_outage)
VALUES
(1, 1, 'online', -18.5, FALSE),
(1, 2, 'offline', NULL, TRUE),
(2, 1, 'online', -20.2, FALSE);

---

\-- Uplink Port Table

---

CREATE TABLE uplink_port (
id SERIAL PRIMARY KEY,
olt_id INTEGER REFERENCES olt(id),
port_number INTEGER,
status VARCHAR(50),
speed VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO uplink_port (olt_id, port_number, status, speed)
VALUES
(1, 1, 'up', '1Gbps'),
(1, 2, 'down', '10Gbps'),
(2, 1, 'up', '10Gbps');

---

\-- VLAN Table

---

CREATE TABLE vlan (
id SERIAL PRIMARY KEY,
olt_id INTEGER REFERENCES olt(id),
vlan_id INTEGER,
name VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO vlan (olt_id, vlan_id, name)
VALUES
(1, 100, 'Management'),
(1, 200, 'CustomerData'),
(2, 300, 'VoIP');

---

\-- ONU Type Table

---

CREATE TABLE onu_type (
id SERIAL PRIMARY KEY,
unique_id VARCHAR(100) UNIQUE,
name VARCHAR(100),
pon_type VARCHAR(50),
image_url TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO onu_type (unique_id, name, pon_type, image_url)
VALUES
('ZTE-ZXA10', 'ZTE ZXA10 F601', 'GPON', '<http://example.com/images/zte_f601.png>'),
('HUA-HG8546M', 'Huawei HG8546M', 'GPON', '<http://example.com/images/huawei_hg8546m.png>');

---

\-- ONU Table

---

CREATE TABLE onu (
id SERIAL PRIMARY KEY,
pon_port_id INTEGER REFERENCES pon_port(id),
serial_number VARCHAR(100) UNIQUE,
status VARCHAR(50),
signal_strength FLOAT,
onu_type_id INTEGER REFERENCES onu_type(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO onu (pon_port_id, serial_number, status, signal_strength, onu_type_id)
VALUES
(1, 'ZTE12345678', 'active', -20.3, 1),
(1, 'ZTE87654321', 'inactive', -30.5, 1),
(3, 'HUA11223344', 'active', -18.9, 2);

---

\-- Zone Table

---

CREATE TABLE zone (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
description TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO zone (name, description)
VALUES
('Zone A', 'Head Office coverage zone'),
('Zone B', 'Residential deployment zone');

---

\-- ODB Table

---

CREATE TABLE odb (
id SERIAL PRIMARY KEY,
zone_id INTEGER REFERENCES zone(id),
name VARCHAR(100),
latitude DECIMAL(10, 8),
longitude DECIMAL(11, 8),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO odb (zone_id, name, latitude, longitude)
VALUES
(1, 'ODB-Alpha', 9.05785000, 7.49508000),
(2, 'ODB-Beta', 9.06582000, 7.48932000);

---

\-- Speed Profile Table

---

CREATE TABLE speed_profile (
id SERIAL PRIMARY KEY,
name VARCHAR(100),
download_speed VARCHAR(50),
upload_speed VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO speed_profile (name, download_speed, upload_speed)
VALUES
('Basic Plan', '20Mbps', '5Mbps'),
('Premium Plan', '100Mbps', '20Mbps');

---

\-- Billing Detail Table

---

CREATE TABLE billing_detail (
id SERIAL PRIMARY KEY,
olt_id INTEGER REFERENCES olt(id),
subscriber_count INTEGER,
average_usage FLOAT,
billing_cycle VARCHAR(50),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO billing_detail (olt_id, subscriber_count, average_usage, billing_cycle)
VALUES
(1, 150, 45.3, 'Monthly'),
(2, 90, 30.2, 'Monthly');