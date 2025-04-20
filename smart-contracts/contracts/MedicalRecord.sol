// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract MedicalRecord is ERC721, Ownable, ReentrancyGuard, AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Role definitions
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant RESEARCHER_ROLE = keccak256("RESEARCHER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum Category {
        GENERAL,
        LAB_REPORT,
        PRESCRIPTION,
        IMAGING,
        VACCINATION,
        SURGERY,
        CONSULTATION,
        EMERGENCY,
        OTHER
    }

    struct Record {
        string ipfsHash;
        address owner;
        uint256 timestamp;
        bool isEncrypted;
        bool exists;
        Category category;
        string[] tags;
        address[] sharedWith;
        mapping(address => bool) hasAccess;
        mapping(bytes32 => bool) roleAccess; // Role-based access
    }

    struct EmergencyAccess {
        address emergencyContact;
        uint256 expiryTime;
        bool isActive;
    }

    struct UserProfile {
        string name;
        string specialization; // For doctors
        string institution;
        bool isVerified;
        uint256 verificationTimestamp;
    }
    
    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecords;
    mapping(uint256 => mapping(address => EmergencyAccess)) public emergencyAccess;
    mapping(address => UserProfile) public userProfiles;
    uint256[] private allRecordIds;
    
    mapping(uint256 => mapping(address => bool)) private sharedAccess;
    mapping(address => uint256[]) private sharedWithMe;
    mapping(uint256 => address[]) private recordSharedAddresses;
    
    // New mappings for categories and tags
    mapping(address => mapping(Category => uint256[])) private recordsByCategory;
    mapping(string => uint256[]) private recordsByTag;
    
    struct RoleChangeRequest {
        address requester;
        bytes32 requestedRole;
        uint256 timestamp;
        bool isPending;
    }
    
    mapping(address => RoleChangeRequest) public roleChangeRequests;
    
    event RecordCreated(uint256 recordId, address owner, Category category);
    event AccessGranted(uint256 recordId, address requester);
    event AccessRevoked(uint256 recordId, address requester);
    event EmergencyAccessGranted(uint256 recordId, address emergencyContact, uint256 expiryTime);
    event EmergencyAccessRevoked(uint256 recordId, address emergencyContact);
    event TagsUpdated(uint256 recordId, string[] tags);
    event RoleGranted(address account, bytes32 role);
    event RoleRevoked(address account, bytes32 role);
    event UserProfileUpdated(address user, string name, string specialization, string institution);
    event RoleChangeRequested(address indexed requester, bytes32 indexed requestedRole);
    event RoleChangeRequestProcessed(address indexed requester, bytes32 indexed requestedRole, bool approved);
    
    constructor() ERC721("MedicalRecord", "MREC") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Caller is not an admin");
        _;
    }

    modifier onlyDoctor() {
        require(hasRole(DOCTOR_ROLE, msg.sender), "Caller is not a doctor");
        _;
    }

    modifier onlyPatient() {
        require(hasRole(PATIENT_ROLE, msg.sender), "Caller is not a patient");
        _;
    }

    modifier onlyResearcher() {
        require(hasRole(RESEARCHER_ROLE, msg.sender), "Caller is not a researcher");
        _;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Role management functions
    function grantRole(bytes32 role, address account) public override onlyAdmin {
        _grantRole(role, account);
        emit RoleGranted(account, role);
    }

    function revokeRole(bytes32 role, address account) public override onlyAdmin {
        _revokeRole(role, account);
        emit RoleRevoked(account, role);
    }

    // User profile management
    function updateUserProfile(
        string memory name,
        string memory specialization,
        string memory institution
    ) public {
        require(bytes(name).length > 0, "Name cannot be empty");
        UserProfile storage profile = userProfiles[msg.sender];
        profile.name = name;
        profile.specialization = specialization;
        profile.institution = institution;
        
        emit UserProfileUpdated(msg.sender, name, specialization, institution);
    }

    function verifyUser(address user) public onlyAdmin {
        UserProfile storage profile = userProfiles[user];
        profile.isVerified = true;
        profile.verificationTimestamp = block.timestamp;
    }

    function recordExists(uint256 recordId) public view returns (bool) {
        return records[recordId].exists;
    }
    
    function createRecord(
        string memory ipfsHash,
        bool isEncrypted,
        Category category,
        string[] memory tags
    ) public {
        require(hasRole(PATIENT_ROLE, msg.sender) || hasRole(DOCTOR_ROLE, msg.sender), 
            "Only patients and doctors can create records");
        require(bytes(ipfsHash).length > 0, "Invalid IPFS hash");
        
        _tokenIds.increment();
        uint256 newRecordId = _tokenIds.current();
        
        Record storage newRecord = records[newRecordId];
        newRecord.ipfsHash = ipfsHash;
        newRecord.owner = msg.sender;
        newRecord.timestamp = block.timestamp;
        newRecord.isEncrypted = isEncrypted;
        newRecord.exists = true;
        newRecord.category = category;
        
        // Add tags
        for(uint i = 0; i < tags.length; i++) {
            newRecord.tags.push(tags[i]);
            recordsByTag[tags[i]].push(newRecordId);
        }
        
        // Add to category mapping
        recordsByCategory[msg.sender][category].push(newRecordId);
        
        // Add to patient records
        patientRecords[msg.sender].push(newRecordId);
        allRecordIds.push(newRecordId);
        
        _mint(msg.sender, newRecordId);
        
        emit RecordCreated(newRecordId, msg.sender, category);
    }
    
    function getPatientRecordIds(address patient) public view returns (uint256[] memory) {
        return patientRecords[patient];
    }
    
    function getRecordDetails(uint256 recordId) public view returns (
        string memory ipfsHash,
        address owner,
        uint256 timestamp,
        bool isEncrypted,
        Category category,
        string[] memory tags
    ) {
        require(recordExists(recordId), "Record does not exist");
        Record storage record = records[recordId];
        require(record.owner != address(0), "Record not properly initialized");
        
        return (
            record.ipfsHash,
            record.owner,
            record.timestamp,
            record.isEncrypted,
            record.category,
            record.tags
        );
    }
    
    function grantAccess(uint256 _recordId, address _to) public {
        require(recordExists(_recordId), "Record does not exist");
        require(_to != address(0), "Invalid address");
        require(_to != msg.sender, "Cannot grant access to yourself");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        require(!sharedAccess[_recordId][_to], "Access already granted");
        
        // Check if recipient has appropriate role
        require(
            hasRole(DOCTOR_ROLE, _to) || 
            hasRole(RESEARCHER_ROLE, _to) || 
            hasRole(PATIENT_ROLE, _to),
            "Recipient must have a valid role"
        );
        
        sharedAccess[_recordId][_to] = true;
        sharedWithMe[_to].push(_recordId);
        recordSharedAddresses[_recordId].push(_to);
        
        emit AccessGranted(_recordId, _to);
    }
    
    function revokeAccess(uint256 _recordId, address _from) public {
        require(recordExists(_recordId), "Record does not exist");
        require(_from != address(0), "Invalid address");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        require(sharedAccess[_recordId][_from], "No access to revoke");
        
        sharedAccess[_recordId][_from] = false;
        
        // Remove from sharedWithMe array
        uint256[] storage shared = sharedWithMe[_from];
        for (uint i = 0; i < shared.length; i++) {
            if (shared[i] == _recordId) {
                shared[i] = shared[shared.length - 1];
                shared.pop();
                break;
            }
        }
        
        // Remove from recordSharedAddresses array
        address[] storage sharedAddrs = recordSharedAddresses[_recordId];
        for (uint i = 0; i < sharedAddrs.length; i++) {
            if (sharedAddrs[i] == _from) {
                sharedAddrs[i] = sharedAddrs[sharedAddrs.length - 1];
                sharedAddrs.pop();
                break;
            }
        }
        
        emit AccessRevoked(_recordId, _from);
    }
    
    function hasAccess(uint256 recordId, address requester) public view returns (bool) {
        if (!recordExists(recordId)) return false;
        return sharedAccess[recordId][requester];
    }
    
    function getSharedWithMeRecords(address _address) public view returns (uint256[] memory) {
        return sharedWithMe[_address];
    }
    
    function getSharedAddresses(uint256 _recordId) public view returns (address[] memory) {
        require(recordExists(_recordId), "Record does not exist");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        return recordSharedAddresses[_recordId];
    }

    function grantEmergencyAccess(
        uint256 _recordId,
        address _emergencyContact,
        uint256 _durationInHours
    ) public {
        require(recordExists(_recordId), "Record does not exist");
        require(_emergencyContact != address(0), "Invalid emergency contact address");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        
        uint256 expiryTime = block.timestamp + (_durationInHours * 1 hours);
        emergencyAccess[_recordId][_emergencyContact] = EmergencyAccess({
            emergencyContact: _emergencyContact,
            expiryTime: expiryTime,
            isActive: true
        });
        
        emit EmergencyAccessGranted(_recordId, _emergencyContact, expiryTime);
    }

    function revokeEmergencyAccess(uint256 _recordId, address _emergencyContact) public {
        require(recordExists(_recordId), "Record does not exist");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        require(emergencyAccess[_recordId][_emergencyContact].isActive, "No active emergency access");
        
        emergencyAccess[_recordId][_emergencyContact].isActive = false;
        emit EmergencyAccessRevoked(_recordId, _emergencyContact);
    }

    function hasEmergencyAccess(uint256 _recordId, address _requester) public view returns (bool) {
        if (!recordExists(_recordId)) return false;
        
        EmergencyAccess memory access = emergencyAccess[_recordId][_requester];
        return access.isActive && block.timestamp <= access.expiryTime;
    }

    function getEmergencyAccessDetails(
        uint256 _recordId,
        address _emergencyContact
    ) public view returns (address contact, uint256 expiryTime, bool isActive) {
        require(recordExists(_recordId), "Record does not exist");
        EmergencyAccess memory access = emergencyAccess[_recordId][_emergencyContact];
        return (access.emergencyContact, access.expiryTime, access.isActive);
    }

    function getRecordsByCategory(Category category) public view returns (uint256[] memory) {
        return recordsByCategory[msg.sender][category];
    }

    function searchRecordsByTag(string memory tag) public view returns (uint256[] memory) {
        uint256[] memory allTaggedRecords = recordsByTag[tag];
        uint256 count = 0;

        // Count how many records belong to the caller
        for (uint i = 0; i < allTaggedRecords.length; i++) {
            if (records[allTaggedRecords[i]].owner == msg.sender) {
                count++;
            }
        }

        // Create array of correct size and fill it
        uint256[] memory userRecords = new uint256[](count);
        uint256 index = 0;
        for (uint i = 0; i < allTaggedRecords.length; i++) {
            if (records[allTaggedRecords[i]].owner == msg.sender) {
                userRecords[index] = allTaggedRecords[i];
                index++;
            }
        }

        return userRecords;
    }

    function updateTags(uint256 recordId, string[] memory newTags) public {
        require(recordExists(recordId), "Record does not exist");
        require(ownerOf(recordId) == msg.sender, "Not the owner of the record");
        
        Record storage record = records[recordId];
        
        // Remove old tags from mapping
        for (uint i = 0; i < record.tags.length; i++) {
            string memory oldTag = record.tags[i];
            uint256[] storage taggedRecords = recordsByTag[oldTag];
            
            // Remove this record from the tag's mapping
            for (uint j = 0; j < taggedRecords.length; j++) {
                if (taggedRecords[j] == recordId) {
                    taggedRecords[j] = taggedRecords[taggedRecords.length - 1];
                    taggedRecords.pop();
                    break;
                }
            }
        }
        
        // Clear old tags
        delete record.tags;
        
        // Add new tags
        for (uint i = 0; i < newTags.length; i++) {
            record.tags.push(newTags[i]);
            recordsByTag[newTags[i]].push(recordId);
        }
        
        emit TagsUpdated(recordId, newTags);
    }

    // Grant role-based access to a record
    function grantRoleAccess(uint256 _recordId, bytes32 _role) public {
        require(recordExists(_recordId), "Record does not exist");
        require(ownerOf(_recordId) == msg.sender, "Not the owner of the record");
        
        Record storage record = records[_recordId];
        record.roleAccess[_role] = true;
    }

    // Check if a role has access to a record
    function hasRoleAccess(uint256 _recordId, bytes32 _role) public view returns (bool) {
        if (!recordExists(_recordId)) return false;
        return records[_recordId].roleAccess[_role];
    }

    // Get user profile
    function getUserProfile(address user) public view returns (
        string memory name,
        string memory specialization,
        string memory institution,
        bool isVerified,
        uint256 verificationTimestamp
    ) {
        UserProfile storage profile = userProfiles[user];
        return (
            profile.name,
            profile.specialization,
            profile.institution,
            profile.isVerified,
            profile.verificationTimestamp
        );
    }

    function requestRoleChange(bytes32 requestedRole) public {
        require(
            requestedRole == PATIENT_ROLE ||
            requestedRole == DOCTOR_ROLE ||
            requestedRole == RESEARCHER_ROLE ||
            requestedRole == ADMIN_ROLE,
            "Invalid role requested"
        );
        
        require(!hasRole(requestedRole, msg.sender), "Already has this role");
        require(!roleChangeRequests[msg.sender].isPending, "Already has a pending request");
        
        roleChangeRequests[msg.sender] = RoleChangeRequest({
            requester: msg.sender,
            requestedRole: requestedRole,
            timestamp: block.timestamp,
            isPending: true
        });
        
        emit RoleChangeRequested(msg.sender, requestedRole);
    }

    function processRoleChangeRequest(address requester, bool approved) public onlyAdmin {
        RoleChangeRequest storage request = roleChangeRequests[requester];
        require(request.isPending, "No pending request");
        
        if (approved) {
            _grantRole(request.requestedRole, requester);
        }
        
        request.isPending = false;
        emit RoleChangeRequestProcessed(requester, request.requestedRole, approved);
    }

    function getPendingRoleRequest(address user) public view returns (
        bytes32 requestedRole,
        uint256 timestamp,
        bool isPending
    ) {
        RoleChangeRequest storage request = roleChangeRequests[user];
        return (request.requestedRole, request.timestamp, request.isPending);
    }
}
