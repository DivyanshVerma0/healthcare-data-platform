// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MedicalRecord is ERC721, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

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
    }

    struct EmergencyAccess {
        address emergencyContact;
        uint256 expiryTime;
        bool isActive;
    }
    
    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecords;
    mapping(uint256 => mapping(address => EmergencyAccess)) public emergencyAccess;
    uint256[] private allRecordIds;
    
    mapping(uint256 => mapping(address => bool)) private sharedAccess;
    mapping(address => uint256[]) private sharedWithMe;
    mapping(uint256 => address[]) private recordSharedAddresses;
    
    // New mappings for categories and tags
    mapping(address => mapping(Category => uint256[])) private recordsByCategory;
    mapping(string => uint256[]) private recordsByTag;
    
    event RecordCreated(uint256 recordId, address owner, Category category);
    event AccessGranted(uint256 recordId, address requester);
    event AccessRevoked(uint256 recordId, address requester);
    event EmergencyAccessGranted(uint256 recordId, address emergencyContact, uint256 expiryTime);
    event EmergencyAccessRevoked(uint256 recordId, address emergencyContact);
    event TagsUpdated(uint256 recordId, string[] tags);
    
    constructor() ERC721("MedicalRecord", "MREC") Ownable() {
        // If you still want to set the owner to msg.sender, you can do:
        // _transferOwnership(msg.sender);
        // But this is redundant since Ownable already sets msg.sender as owner
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
}
