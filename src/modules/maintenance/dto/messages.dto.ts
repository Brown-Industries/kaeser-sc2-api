export class Message {
  messageType: string;
  messageId: number;
  messageDate: Date;
  message: string;

  constructor(data: any) {
    this.messageType = data.ReportTypeTxt.replace('message', '').trim();
    const tempDate = data.ReportDateTime.replace('AM', '')
      .replace('PM', '')
      .trim();
    this.messageId = data.ReportId;
    this.messageDate = new Date(tempDate);
    this.message = data.Text.replace('\n', '').trim();
  }
}

export class MessagesDto {
  messages: Message[];

  constructor(data: any) {
    this.messages = [];

    if (data && data['3'] && typeof data['3'] === 'object') {
      for (const key in data['3']) {
        if (data['3'].hasOwnProperty(key)) {
          const messageData = data['3'][key];
          const message = new Message(messageData);
          this.messages.push(message);
        }
      }
    }
  }

  toObj() {
    return this.messages;
  }
}
