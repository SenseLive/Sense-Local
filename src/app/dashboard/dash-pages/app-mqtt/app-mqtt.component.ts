// Import necessary modules
import { Component, OnInit, OnDestroy } from '@angular/core';
import * as mqtt from 'mqtt';

@Component({
  selector: 'app-app-mqtt',
  templateUrl: './app-mqtt.component.html',
  styleUrls: ['./app-mqtt.component.css']
})
export class AppMqttComponent implements OnInit, OnDestroy {

  private mqttBrokerUrl = 'mqtt://13.232.24.140:1883'; // Replace with your MQTT broker address and port
  private mqttClient!: mqtt.Client;
  private mqttTopic = 'example/topic'; // Replace with the topic you want to subscribe/publish

  constructor() { }

  ngOnInit(): void {
    this.connectToBroker();
  }

  ngOnDestroy(): void {
    this.disconnectFromBroker();
  }

  private connectToBroker(): void {
    this.mqttClient = mqtt.connect(this.mqttBrokerUrl);

    this.mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker');
      this.subscribeToTopic();
      // You can perform additional actions after a successful connection here
    });

    this.mqttClient.on('error', (error) => {
      console.error('Error connecting to MQTT broker:', error);
    });

    this.mqttClient.on('message', (topic, message) => {
      console.log('Received message on topic', topic, ':', message.toString());
      // Process the incoming message
    });
  }

  private subscribeToTopic(): void {
    this.mqttClient.subscribe(this.mqttTopic, (err) => {
      if (!err) {
        console.log('Subscribed to', this.mqttTopic);
      }
    });
  }

  public publishMessage(): void {
    const message = 'Hello, MQTT!';
    this.mqttClient.publish(this.mqttTopic, message);
    console.log('Published message:', message);
  }

  private disconnectFromBroker(): void {
    if (this.mqttClient) {
      // Disconnect from the MQTT broker
      this.mqttClient.end();
      console.log('Disconnected from MQTT broker');
    }
  }
}
