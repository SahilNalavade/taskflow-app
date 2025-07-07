// Mentions Parser Utility
// Handles @mentions parsing and detection in comments and messages

import { demoData } from '../services/demoData';
import { realtimeEngine } from '../services/realtimeEngine';

export class MentionsParser {
  constructor(teamMembers = []) {
    this.teamMembers = teamMembers.length > 0 ? teamMembers : demoData.teamMembers;
    this.mentionRegex = /@(\w+[\w\s]*\w|\w)/g;
  }

  // Parse text and find mentions
  parseMentions(text) {
    const mentions = [];
    const matches = text.matchAll(this.mentionRegex);
    
    for (const match of matches) {
      const mentionText = match[1].toLowerCase();
      const matchedMember = this.findMemberByMention(mentionText);
      
      if (matchedMember) {
        mentions.push({
          originalText: match[0],
          mentionText: mentionText,
          member: matchedMember,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }

    return mentions;
  }

  // Find team member by mention text
  findMemberByMention(mentionText) {
    const searchText = mentionText.toLowerCase();
    
    // Try exact name match first
    let match = this.teamMembers.find(member => 
      member.name.toLowerCase() === searchText
    );
    
    if (match) return match;

    // Try first name match
    match = this.teamMembers.find(member => 
      member.name.toLowerCase().split(' ')[0] === searchText
    );
    
    if (match) return match;

    // Try last name match
    match = this.teamMembers.find(member => {
      const nameParts = member.name.toLowerCase().split(' ');
      return nameParts.length > 1 && nameParts[nameParts.length - 1] === searchText;
    });
    
    if (match) return match;

    // Try partial name match
    match = this.teamMembers.find(member => 
      member.name.toLowerCase().includes(searchText)
    );
    
    return match;
  }

  // Convert text with mentions to HTML with highlights
  renderMentionsAsHTML(text) {
    const mentions = this.parseMentions(text);
    
    if (mentions.length === 0) {
      return text;
    }

    let result = text;
    let offset = 0;

    mentions.forEach(mention => {
      const beforeMention = result.substring(0, mention.startIndex + offset);
      const afterMention = result.substring(mention.endIndex + offset);
      
      const mentionHTML = `<span style="
        background-color: #dbeafe;
        color: #1e40af;
        padding: 1px 4px;
        border-radius: 3px;
        font-weight: 600;
      ">@${mention.member.name}</span>`;
      
      result = beforeMention + mentionHTML + afterMention;
      offset += mentionHTML.length - mention.originalText.length;
    });

    return result;
  }

  // Get suggestions for autocomplete
  getMentionSuggestions(query) {
    if (!query || query.length < 1) {
      return this.teamMembers.slice(0, 5); // Show first 5 members
    }

    const searchQuery = query.toLowerCase();
    
    const suggestions = this.teamMembers.filter(member => {
      const name = member.name.toLowerCase();
      const firstName = name.split(' ')[0];
      const lastName = name.split(' ')[1] || '';
      
      return name.includes(searchQuery) || 
             firstName.startsWith(searchQuery) ||
             lastName.startsWith(searchQuery);
    });

    // Sort by relevance
    return suggestions.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact match first
      if (aName === searchQuery) return -1;
      if (bName === searchQuery) return 1;
      
      // First name starts with query
      if (aName.split(' ')[0].startsWith(searchQuery)) return -1;
      if (bName.split(' ')[0].startsWith(searchQuery)) return 1;
      
      // Contains query
      return aName.indexOf(searchQuery) - bName.indexOf(searchQuery);
    }).slice(0, 8); // Limit to 8 suggestions
  }

  // Process mentions in a comment and trigger notifications
  processMentionsInComment(text, taskId, fromUserId, fromUserName) {
    const mentions = this.parseMentions(text);
    
    mentions.forEach(mention => {
      // Don't notify if user mentions themselves
      if (mention.member.id !== fromUserId) {
        // Emit mention event
        realtimeEngine.emit('user_mentioned', {
          mentionedUserId: mention.member.id,
          mentionedUserName: mention.member.name,
          taskId: taskId,
          message: text,
          fromUser: fromUserId,
          fromUserName: fromUserName,
          timestamp: new Date().toISOString()
        });
      }
    });

    return mentions;
  }

  // Validate mention text
  isValidMention(text) {
    const mentions = this.parseMentions(text);
    return mentions.length > 0;
  }

  // Get all mentioned users from text
  getMentionedUsers(text) {
    const mentions = this.parseMentions(text);
    return mentions.map(mention => mention.member);
  }

  // Format mention for display
  formatMentionForDisplay(member) {
    return `@${member.name}`;
  }

  // Get mention statistics
  getMentionStats(messages) {
    const stats = {
      totalMentions: 0,
      mentionsByUser: {},
      mostMentionedUser: null,
      mostActiveUser: null
    };

    messages.forEach(message => {
      const mentions = this.parseMentions(message.text || message.content || '');
      stats.totalMentions += mentions.length;

      mentions.forEach(mention => {
        const userId = mention.member.id;
        if (!stats.mentionsByUser[userId]) {
          stats.mentionsByUser[userId] = {
            user: mention.member,
            count: 0
          };
        }
        stats.mentionsByUser[userId].count++;
      });
    });

    // Find most mentioned user
    const mentionCounts = Object.values(stats.mentionsByUser);
    if (mentionCounts.length > 0) {
      stats.mostMentionedUser = mentionCounts.reduce((prev, current) => 
        prev.count > current.count ? prev : current
      );
    }

    return stats;
  }
}

// Singleton instance
export const mentionsParser = new MentionsParser();

// React Hook for mentions
export const useMentions = (teamMembers = []) => {
  const parser = new MentionsParser(teamMembers);
  
  return {
    parseMentions: (text) => parser.parseMentions(text),
    renderMentionsAsHTML: (text) => parser.renderMentionsAsHTML(text),
    getMentionSuggestions: (query) => parser.getMentionSuggestions(query),
    processMentionsInComment: (text, taskId, fromUserId, fromUserName) => 
      parser.processMentionsInComment(text, taskId, fromUserId, fromUserName),
    getMentionedUsers: (text) => parser.getMentionedUsers(text)
  };
};