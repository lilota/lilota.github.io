# To Do List
This is a to do list for Lilota describing general things that are needed to be done

## Minor changes:
These are minor changes that are additional features to current modules

### Toggle for GPIO
[Description](https://github.com/lilota/lilota.github.io/blob/main/README.md#nci-toggle)  

### Status for Wifi
[Description](https://github.com/lilota/lilota.github.io/blob/main/README.md#nci-status)  

### Subscribedhandles for MQTT
[Description](https://github.com/lilota/lilota.github.io/blob/main/README.md#nci-subscribedhandles)  

### Status enhancement for MQTT
[Description](https://github.com/lilota/lilota.github.io/blob/main/README.md#status)  

## Major Changes:
These are major changes that may take much longer.

### i2s
We need to also support i2s which we currently do not support

### i2c precoded configuration examples
In order to make i2c more simple to use, there needs to be precofigured code for the i2c devices that exist out there.  
Currently, we only have things like rfid and a 2 line LCD display.  
The most ideal would be for us to have preconfigured code for every i2c device that is out there.  
However that is not very realistic. We can start by at least have preconfigured code for devices that ESPHome and Tasmota support.  
[ESPHome](https://esphome.io/components/index.html#sensor-components)  
[Tasmota](https://tasmota.github.io/docs/I2CDEVICES/)  
This also applies to I2S, ADC, SPI

### Web IDE
Currently the [web IDE](https://lilota.github.io/ide.html) literally does nothing is just there to look pretty.  
We need to make this actually function and work.  
We also need to detect for Firefox as Firefox does not support webserial and use another way to flash. 

