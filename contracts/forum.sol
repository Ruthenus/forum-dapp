// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

contract Forum {
    struct Post {
        string content;
        address author;
        uint timestamp;
        uint like;
    }

    Post[] posts;

    function create_post(string memory content) external {
        posts.push(Post(content, msg.sender, block.timestamp, 0));
    }

    function get_posts() external view returns (Post[] memory) {
        return posts;
    }

    function get_post(uint idx) external view returns (Post memory) {
        require(idx < posts.length, "Not found");
        return posts[idx];
    }
}
