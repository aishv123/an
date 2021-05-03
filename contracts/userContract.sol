pragma solidity >=0.4.22 <0.7.0;

contract userRegistration {
    address owner;

    mapping(uint256 => userIdentity) identityMap;
    mapping(string => bool) emailId;
    mapping(uint256 => bool) contactNum;

    struct userIdentity {
        uint256 contact_no;
        string email;
        string accountId;
        string cid;
    }

    constructor() public {
        owner = msg.sender; //Assigns the sender who is deploying this contract as the owner
    }

    modifier isOwner() {
        require(msg.sender == owner, "Access is not allowed"); //Modifier checks whether sender is the owner so that access will be allowed
        _;
    }

    function setUserDetails(
        uint256 _userId,
        uint256 _contact_no,
        string memory _email,
        string memory _accountId,
        string memory _cid
    ) public isOwner {
        require(!emailId[_email], "Email Exists");
        require(!contactNum[_contact_no], "Contact Number Exists");

        userIdentity memory identity;
        identity.contact_no = _contact_no;
        identity.email = _email;
        identity.accountId = _accountId;
        identity.cid = _cid;

        identityMap[_userId] = identity;
        contactNum[_contact_no] = true;
        emailId[_email] = true;
    }

    function getaccountId(uint256 _userId) public view returns (string memory) {
        userIdentity memory _id = identityMap[_userId];
        return (_id.accountId);
    }

    function getsecretId1(uint256 userId)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            string memory
        )
    {
        userIdentity memory _id = identityMap[userId];
        return (
            _id.contact_no,
            _id.email,
            _id.accountId,
            _id.cid
        );
    }
}
