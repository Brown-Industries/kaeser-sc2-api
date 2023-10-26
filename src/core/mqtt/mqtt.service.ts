import { Injectable } from '@nestjs/common';
import { connect } from 'mqtt';
import { Logger } from 'nestjs-pino';
import { EventEmitter } from 'events';

@Injectable()
export class MqttService extends EventEmitter {
  constructor(private readonly logger: Logger) {
    super();
  }

  private mqttActive;

  private mqttClient;

  isActive(): boolean {
    return this.mqttActive;
  }

  onModuleInit() {
    const host = process.env.MQTT_HOST;
    const port = process.env.MQTT_PORT || 1883;
    const user = process.env.MQTT_USER;
    const pass = process.env.MQTT_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.error('Missing MQTT config. MQTT is disabled.');
      return;
    }

    const clientId = `majb_${Math.random().toString(16).slice(3)}`;

    const connectUrl = `mqtt://${host}:${port}`;

    this.mqttClient = connect(connectUrl, {
      clientId,
      clean: true,
      keepalive: 60,
      connectTimeout: 4000,
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASS,
      reconnectPeriod: 1000,
    });

    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT');
      this.mqttActive = true;
      this.emit('connected');
    });

    this.mqttClient.on('error', (error) => {
      this.logger.error(`MQTT error: ${error}`);
      this.mqttActive = false;
    });
  }

  // Method to subscribe to a topic and provide a callback
  subscribeToTopic(topic: string, callback: (payload: any) => void): void {
    if (this.mqttClient && this.mqttActive) {
      this.mqttClient.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to topic ${topic}: ${err}`);
        } else {
          this.logger.log(`Successfully subscribed to topic ${topic}`);
        }
      });

      this.mqttClient.on('message', (topicName, message) => {
        if (topicName === topic) {
          callback(message.toString());
        }
      });
    } else {
      this.logger.warn(
        'Attempted to subscribe while MQTT client is inactive or not initialized.',
      );
    }
  }
}