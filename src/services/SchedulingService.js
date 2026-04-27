const Content = require('../models/Content');

class SchedulingService {
  static async getActiveContent(teacherId, subject = null) {
    const currentTime = new Date();
    
    if (subject) {
      const contentList = await Content.getApprovedContentBySubject(subject, currentTime);
      return this.getCurrentContent(contentList);
    }
    
    const contentList = await Content.getApprovedContent(teacherId, currentTime);
    return this.getCurrentContent(contentList);
  }

  static getCurrentContent(contentList) {
    if (contentList.length === 0) {
      return null;
    }

    if (contentList.length === 1) {
      return contentList[0];
    }

    const subjectGroups = this.groupBySubject(contentList);
    const currentSubject = this.getCurrentSubject(subjectGroups);
    
    if (!currentSubject || subjectGroups[currentSubject].length === 0) {
      return null;
    }

    const subjectContent = subjectGroups[currentSubject];
    return this.getContentByRotation(subjectContent);
  }

  static groupBySubject(contentList) {
    return contentList.reduce((groups, content) => {
      if (!groups[content.subject]) {
        groups[content.subject] = [];
      }
      groups[content.subject].push(content);
      return groups;
    }, {});
  }

  static getCurrentSubject(subjectGroups) {
    const subjects = Object.keys(subjectGroups);
    if (subjects.length === 0) return null;
    if (subjects.length === 1) return subjects[0];

    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const subjectIndex = Math.floor(totalMinutes / 30) % subjects.length;
    
    return subjects[subjectIndex];
  }

  static getContentByRotation(contentList) {
    if (contentList.length === 1) {
      return contentList[0];
    }

    const now = new Date();
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const contentIndex = Math.floor(totalMinutes / 5) % contentList.length;
    
    return contentList[contentIndex];
  }

  static async getTeacherLiveContent(teacherId) {
    const activeContent = await this.getActiveContent(teacherId);
    
    if (!activeContent) {
      return { message: "No content available" };
    }

    return {
      id: activeContent.id,
      title: activeContent.title,
      description: activeContent.description,
      subject: activeContent.subject,
      file_url: activeContent.file_url,
      file_type: activeContent.file_type,
      uploader_name: activeContent.uploader_name
    };
  }
}

module.exports = SchedulingService;
