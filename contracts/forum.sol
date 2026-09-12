// SPDX-License-Identifier: MIT
// https://spdx.org/licenses/MIT.html
pragma solidity >=0.8.2 <0.9.0;

contract Forum {
    struct Post {
        string content;
        address author;
        uint timestamp;
        uint like; // кількість вподобайок
    }

    Post[] posts;

    // Хто вже вподобав пост: postId => voter => alreadyLiked
    // https://docs.soliditylang.org/en/latest/types.html#mapping-types
    mapping(uint => mapping(address => bool)) public hasLiked;

    // Створити пост
    // block.timestamp — час поточного блоку (секунди)
    function create_post(string memory content) external {
        posts.push(Post(content, msg.sender, block.timestamp, 0));
    }

    // Поставити вподобайку (один раз з однієї адреси)
    function like_post(uint idx) external {
        // https://docs.soliditylang.org/en/latest/control-structures.html#error-handling-assert-require-revert-and-exceptions
        require(idx < posts.length, unicode"Не знайдено");
        require(!hasLiked[idx][msg.sender], unicode"Уже вподобано");

        hasLiked[idx][msg.sender] = true;
        posts[idx].like += 1;
    }

    // Усі пости
    function get_posts() external view returns (Post[] memory) {
        return posts;
    }

    // Один пост за індексом
    function get_post(uint idx) external view returns (Post memory) {
        require(idx < posts.length, unicode"Не знайдено");
        return posts[idx];
    }
}
