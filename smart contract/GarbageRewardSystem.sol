
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GarbageRewardSystem {
    struct GarbageSubmission {
        uint256 submissionId;
        address submitter;
        string trashType;
        uint256 weightKg;
        string locationType;
        string citizenType;
        uint256 areaDirtinessLevel;
        uint256 rewardAmount;
        uint256 timestamp;
    }

    mapping(uint256 => GarbageSubmission) public submissions;
    uint256 private nextSubmissionId;

    event GarbageSubmitted(
        uint256 indexed submissionId,
        address indexed submitter,
        string trashType,
        uint256 weightKg,
        uint256 rewardAmount,
        uint256 timestamp
    );

    constructor() {
        nextSubmissionId = 1;
    }

    // Public getter for nextSubmissionId (for frontend reference)
    function getNextSubmissionId() public view returns (uint256) {
        return nextSubmissionId;
    }


    function submitGarbage(
        string memory _trashType,
        uint256 _weightKg,
        string memory _locationType,
        string memory _citizenType,
        uint256 _areaDirtinessLevel,
        uint256 _rewardAmount
    ) public {
        require(_weightKg > 0, "Weight must be greater than 0");
        require(_areaDirtinessLevel >= 1 && _areaDirtinessLevel <= 5, "Area dirtiness level must be between 1 and 5");
        require(_rewardAmount > 0, "Reward amount must be greater than 0");

        uint256 currentSubmissionId = nextSubmissionId;
        submissions[currentSubmissionId] = GarbageSubmission({
            submissionId: currentSubmissionId,
            submitter: msg.sender,
            trashType: _trashType,
            weightKg: _weightKg,
            locationType: _locationType,
            citizenType: _citizenType,
            areaDirtinessLevel: _areaDirtinessLevel,
            rewardAmount: _rewardAmount,
            timestamp: block.timestamp
        });

        nextSubmissionId++;

        emit GarbageSubmitted(
            currentSubmissionId,
            msg.sender,
            _trashType,
            _weightKg,
            _rewardAmount,
            block.timestamp
        );
    }


    function getSubmission(uint256 _submissionId)
        public
        view
        returns (
            uint256 submissionId,
            address submitter,
            string memory trashType,
            uint256 weightKg,
            string memory locationType,
            string memory citizenType,
            uint256 areaDirtinessLevel,
            uint256 rewardAmount,
            uint256 timestamp
        )
    {
        GarbageSubmission storage submission = submissions[_submissionId];
        require(submission.submissionId != 0, "Submission does not exist");
        return (
            submission.submissionId,
            submission.submitter,
            submission.trashType,
            submission.weightKg,
            submission.locationType,
            submission.citizenType,
            submission.areaDirtinessLevel,
            submission.rewardAmount,
            submission.timestamp
        );
    }


    function getTotalSubmissions() public view returns (uint256) {
        return nextSubmissionId - 1;
    }
}
