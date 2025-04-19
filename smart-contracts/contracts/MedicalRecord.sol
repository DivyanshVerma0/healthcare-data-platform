// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MedicalRecord is ERC721, Ownable {
    struct Record {
        string ipfsHash;
        address owner;
        uint256 timestamp;
        bool isEncrypted;
        bool exists;
        mapping(address => bool) accessGranted;
    }
    
    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecords;
    uint256[] private allRecordIds;
    
    mapping(uint256 => mapping(address => bool)) private sharedAccess; // recordId => address => hasAccess
    mapping(address => uint256[]) private sharedWithMe; // address => array of recordIds shared with them
    mapping(uint256 => address[]) private recordSharedAddresses; // recordId => array of addresses with access
    
    event RecordCreated(uint256 recordId, address owner);
    event AccessGranted(uint256 recordId, address requester);
    event AccessRevoked(uint256 recordId, address requester);
    
    constructor() ERC721("MedicalRecord", "MREC") Ownable(msg.sender) {}
    
    function recordExists(uint256 recordId) public view returns (bool) {
        return records[recordId].exists;
    }
    
    function createRecord(string memory ipfsHash, bool isEncrypted) public {
        uint256 recordId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        _safeMint(msg.sender, recordId);
        
        Record storage newRecord = records[recordId];
        newRecord.ipfsHash = ipfsHash;
        newRecord.owner = msg.sender;
        newRecord.timestamp = block.timestamp;
        newRecord.isEncrypted = isEncrypted;
        newRecord.exists = true;
        
        patientRecords[msg.sender].push(recordId);
        allRecordIds.push(recordId);
        
        emit RecordCreated(recordId, msg.sender);
    }
    
    function getPatientRecordIds(address patient) public view returns (uint256[] memory) {
        return patientRecords[patient];
    }
    
    function getRecordDetails(uint256 recordId) public view returns (
        string memory ipfsHash,
        address owner,
        uint256 timestamp,
        bool isEncrypted
    ) {
        require(recordExists(recordId), "Record does not exist");
        Record storage record = records[recordId];
        require(record.owner != address(0), "Record not properly initialized");
        
        return (
            record.ipfsHash,
            record.owner,
            record.timestamp,
            record.isEncrypted
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
}
