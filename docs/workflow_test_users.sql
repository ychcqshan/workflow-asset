-- Clear existing test data
DELETE FROM sys_user_role WHERE user_id >= 10;
DELETE FROM sys_user WHERE id >= 10;
DELETE FROM sys_dept WHERE id >= 10;

-- 1. Create Departments
-- id, parent_id, dept_name, order_num, leader_id, director_id, status, del_flag, create_time, update_time
-- Company Root (id: 10)
INSERT INTO sys_dept (id, parent_id, dept_name, order_num, leader_id, director_id, status, del_flag, create_time, update_time)
VALUES (10, 0, 'Headquarters', 1, NULL, NULL, '0', '0', NOW(), NOW());

-- IT Center (id: 11, parent_id: 10)
INSERT INTO sys_dept (id, parent_id, dept_name, order_num, leader_id, director_id, status, del_flag, create_time, update_time)
VALUES (11, 10, 'IT Center', 1, NULL, NULL, '0', '0', NOW(), NOW());

-- Development Dept (id: 12, parent_id: 11)
INSERT INTO sys_dept (id, parent_id, dept_name, order_num, leader_id, director_id, status, del_flag, create_time, update_time)
VALUES (12, 11, 'Development Dept', 1, NULL, NULL, '0', '0', NOW(), NOW());

-- Testing Dept (id: 13, parent_id: 11)
INSERT INTO sys_dept (id, parent_id, dept_name, order_num, leader_id, director_id, status, del_flag, create_time, update_time)
VALUES (13, 11, 'Testing Dept', 2, NULL, NULL, '0', '0', NOW(), NOW());

-- 2. Create Users
-- id, dept_id, username, nickname, password, email, phonenumber, sex, avatar, status, del_flag, create_time, update_time
-- Password default to '123456' hashed via BCrypt (using a known hash for 123456: $2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2)

-- Alice (Regular Employee in Development Dept)
INSERT INTO sys_user (id, dept_id, username, nickname, password, email, phonenumber, sex, avatar, status, del_flag, create_time, update_time)
VALUES (10, 12, 'alice', 'Alice Developer', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'alice@eam.com', '13800000001', '1', '', '0', '0', NOW(), NOW());

-- Bob (Leader of Development Dept)
INSERT INTO sys_user (id, dept_id, username, nickname, password, email, phonenumber, sex, avatar, status, del_flag, create_time, update_time)
VALUES (11, 12, 'bob', 'Bob DevLeader', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'bob@eam.com', '13800000002', '0', '', '0', '0', NOW(), NOW());

-- Carol (Director of IT Center)
INSERT INTO sys_user (id, dept_id, username, nickname, password, email, phonenumber, sex, avatar, status, del_flag, create_time, update_time)
VALUES (12, 11, 'carol', 'Carol ITDirector', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'carol@eam.com', '13800000003', '1', '', '0', '0', NOW(), NOW());

-- Dave (Asset Administrator in Headquarters)
INSERT INTO sys_user (id, dept_id, username, nickname, password, email, phonenumber, sex, avatar, status, del_flag, create_time, update_time)
VALUES (13, 10, 'dave', 'Dave AssetAdmin', '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOZTH.ulu33dHOiBE8ByOhJIrdAu2', 'dave@eam.com', '13800000004', '0', '', '0', '0', NOW(), NOW());

-- 3. Update Departments with Leader and Director IDs
UPDATE sys_dept SET leader_id = 11 WHERE id = 12;      -- Bob is leader of Dev Dept
UPDATE sys_dept SET director_id = 12 WHERE id = 11;    -- Carol is director of IT Center
UPDATE sys_dept SET director_id = 12 WHERE id = 12;    -- Carol is also the director for Dev Dept

-- 4. Assign Roles to Users
-- Assume roles exist: 2 might be ordinary user, 3 asset admin, etc.
-- But the workflow assigns by role key "asset_admin" for the final step of AssetBorrowProcess.
-- Let's check sys_role table for id of asset_admin or create it.
-- We'll insert an asset_admin role if it doesn't exist.
INSERT INTO sys_role (id, role_name, role_key, role_sort, status, del_flag, create_time, update_time)
SELECT 10, 'Asset Administrator', 'asset_admin', 2, '0', '0', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (SELECT * FROM sys_role WHERE role_key = 'asset_admin');

-- Assign 'asset_admin' role (id: 10) to Dave
INSERT INTO sys_user_role (user_id, role_id)
VALUES (13, 10);
