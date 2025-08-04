# Intro to Lilota

Lilota is an open source embedded systems firmware for microcontrollers such as the ESP32, ESP8266, and Arduino Pico to be used in an IoT home automation system. 

A microcontroller flashed with Lilota uses [TCL](https://www.tcl-lang.org/about/language.html) files to interface with connected hardware.  
(NCI) \= Not currently Implemented

# Prerequisites

1. Supported Microcontroller: ESP32, ESP8266, Raspberry Pi Pico  
   1. For microcontroller boards without built in serial programmers, you will also need a separate serial programmer  
2. Computer with Linux, MacOS, or Windows  
3. USB data cable (Some are power delivery only)  
4. (NCI) Prebuilt firmware (pretend there is a link to download prebuilt versions) or [build your own](https://github.com/COMPAS-Lab/lilota)  
   1. I’m hoping that there will be at least one version where you don’t have to install your own prerequisite software and only need to install the Lilota IDE

# (NCI) Setup \- IDE method

1. Install the lilota IDE (We should make this windows compatible(most people use windows after all))  
2. Use IDE to flash built files onto esp/pico  
3. After flashing, a gui menu will pop up to configure wifi, mqtt, etc (this menu can be brought up later through the IDE  
4. Everything will have been setup and all you need to do is create files which can then be flashed onto the board

(I can’t exactly describe anything else because the IDE is broken :(

# Setup \- Terminal method

1. Follow the [contributing.md file](https://github.com/COMPAS-Lab/lilota/blob/main/CONTRIBUTING.md)

# Useage

To start, create a new TCL file 

## TCL Fundamentals

### Comments:

To declare a line or a part of a line as a comment, put a “\#” in front of it  

#### Example:
```
#Ex1: 
puts 5; #prints out a 5

#Ex2:
#The line above prints out a 5
```
### Semicolon:

Declares the end of a line and allows for another action to be called. Can be replaced by a new line  

#### Example:
```
#Ex1:
puts 5; #prints out a 5

#Ex2:
puts 5; puts 100; #prints out a 5 then prints out a 100 in the next line
```

### source:

Runs another TCL script within the current TCL environment

#### Example:
```
#Ex1: (Currently in the terminal)
source something.tcl

#Ex2: (Currently running something.tcl)
puts "something"
source somethingElse.tcl; #Will now run somethingElse.tcl which will print out "something else"

#Ex3:
source motors.tcl; #initalize the functions necessary to run motor pwm
move $FORWARD 100
```

### puts:

Prints out values or commands  
Syntax: puts ?-nonewline? value A/N: the nonewline flag does not work  

#### Example
```
#Ex1: 
puts 5

#Ex2:
puts “hello world”

#Ex3: 
puts “h”
puts -nonewline “i”

#Ex4:
set num 5
puts "num's value is $num"

#Ex5:
set num 5  
puts "num - 4 = [expr $num - 4]"
```

### set: 

creates a variable under the variableName if variableName does not exist and assigns value to it
Syntax: set variableName *value*  

#### Example:
```
#Ex1:
set num 5

#Ex2:
set led [gpio -mode out 12]; #led gets assigned to a refrence of a gpio object with pin 12 and mode "out"
```

### global: 

Makes a variable useable outside of the current space or brings in a global variable into the current space like a loop or a different TCL script  
Syntax: global *varible*  

#### Example:
```
global var
```

### Dollar sign($):

Accesses the value of a variable  

#### Example:
```
#Ex1:
set hi 5  
puts $hi; \#prints out 5

#Ex2:
set led [gpio -mode out 12]; #led holds a refrence to a gpio object
$led on; #calls the refrence to the led gpio object to use its methods
```

### Square Brackets([]):

Calls the interpreter recursively

#### Example:
```
#Ex1:
puts [expr 3 * 2]

#Ex2:
set led [gpio -mode out 12]; #gpio function is called first and returns a refrence to a gpio object with pin 12 and mode "out"
```

### expr:

Evaluates and returns given expression

#### Example:
```
#Ex1:
set a 3
set b 2
set c [expr $a + $b]

#Ex2:
puts [4 * 3 / (2 * 3)]; #prints 2
```

### proc:

Creates a function that you can call in the future.  
Define syntax: proc *functionName* {parameters} {function}  
Call syntax: *functionName* *parameters*  
Default parameters: replace *parameter* with {*parameter* *defaultValue*}

#### Example:
```
proc print {val {times 1}} {  
    for {set i 0} {$i < $times} {incr i} {  
        puts $val
    }  
}  
print hello
print "this will print 3 times" 3
```

### incr:

Increments a variable by a selected value  
Syntax: incr variableName *amount*  
- *amount* defaults to 1

#### Example:
```
#Ex1:
incr num; #this increments num by 1

#Ex2:
incr num 3; #this increments num by 3
```
### decr:

Decrements a variable by a selected value  
Syntax: decr variableName *amount* 
- *amount* defaults to 1

#### Example:
```
#Ex1:
decr num; #this decrements num by 1

#Ex2:
decr num 4; #this decrements num by 4
```

## Logic Statements

### if statements:

If a condition is true, then do something if it isn't then do something else
Syntax: if {condition} {do this} elseif {condition} {do this} else {do this}  

#### Example:
```
if {[expr $num > 5]} {  
    puts big  
} elseif {[expr $num < 5 && $num >3]} {  
    puts med  
} else {  
    puts small  
}
```
### for loops:

For the condition provided, loop while also executing something before every next loop  
Syntax: for {set *variable* *value*} {*condition*} {*executedThing*} {*loopedCode*}  

#### Example:
```
for {set i 0} {[expr $i < 11]} {incr i} { #prints out i from 0 to 10  
    puts $i  
}
```

### foreach loops:
For each value in an array, assign the value to the given variable and loop the inside code the by the length of the array
Syntax: foreach *loopingVariable* *arrayVariable* {*loopedCode*}  

#### Example: 
```
set $myArray {"a" "b" "c" "d" "e" "f" "g" "h" "i" "j" "k" "l" "m" "n" "o" "p" "q" "r" "s" "t" "u" "v" "w" "x" "y" "z"}
foreach i $myArray {
    puts $i
}
```

### while loops:

While the condition provided is true, loop  
Syntax: while {*condition*} {loopedCode}  

#### Example:
```
set j 0  
while {$j < 10} { #prints out i from 0 to 9 but excludes 6 and 7  
    puts $j  
    if {$j == 5} { incr j 2 }  
    incr j
}
```

## Timers and Callbacks

### after:

After a certain amount of time(ms), run what is inside of the after function call.  
If there is nothing inside of the function call, it pauses the thread that is currently running the code  
Syntax: after *time* {script}  

#### Example:
```
Ex1:
after 500 {puts “hi”}

Ex2:
after 1000  
puts “bye”

Ex3:
after 100 {puts "this will print last"}
puts "this will print first"
```

### sleep:

Pauses the thread for a certain amount of time(s) 
Syntax: sleep *time*  

#### Example:
```
sleep .5; #sleeps for half a second
```

## Structures and Objects:

Structures take on the same syntax as functions that return a refrence back to create objects

### Theoretical functionality (Behind the scenes)

We define structures as a function that returns a refrence to other functionality
```
proc printer {} {
    set ref [rand]
    proc $ref {type val} {
        if ($type == "print"} {
            puts $val
        } elseif {$type == "nolinePrint"} {
	    puts -nonewline $val
        } else {
            puts "error"
        }
    }
    return $ref
}
```
With the *printer* structure defined, we can create an object by setting the refrence to a variable
```
set object [printer]
$object nolinePrint "The number I will print is "
$object print 5
```

## Built in Hardware Structures:

### gpio:

Initialization:
set *gpioObject* [gpio -mode In/Out -pull Up/Down/None pinNo]

#### GPIO Command List:
- set
- change
- get
- on
- off
- (NCI) toggle
- mode
- pulse
- onpulse

#### set:

Set the level of a GPIO pin  
Syntax: *gpioObject* set *intValue*  
```
set led [gpio -mode out 12]  
$led set 1; #This will turn on the LED  
$led set 0; #This will turn off the LED
[gpio -mode out 12] set 1; #This will turn on the LED
```

#### change:

When there is a change in the state of the GPIO pin, run the callback  
Syntax: *gpioObject* change {callback}  
```
# When button is pressed, led on. When button is released, led off  
set button [gpio -mode in 5]  
set led [gpio -mode out 12]  
$button change { 
  global led  
  if { $value } {  # or [$this get]  
    $led on  
  } else {  
    $led off  
  }  
}
```

#### get:

Returns the state of the GPIO pin  
Syntax: *gpioObject* get  
```
set button [gpio -mode in 5]  
if {$button get} {
    puts "Button is not pressed"
} else {
    puts "Button is pressed"
}
```

#### on:

Sets the gpio pin to state 1  
Syntax: *gpioObject* on  
```
set led [gpio -mode out 12]  
$led on
```

#### off:

Sets the gpio pin to state 0  
Syntax: *gpioObject* off  
```
set led [gpio -mode out 12]  
$led off
```

#### (NCI) toggle:

Flips state of the gpio pin
Syntax: *gpioObject* toggle  
```
set led [gpio -mode out 12]
$led toggle; #The led turns on  
$led toggle; #The led turns off
```

#### mode:

Sets the mode of the gpio pin to be either input or output  
Syntax: *gpioObject* mode *In/Out*  
```
set led [gpio -mode in 12]
if {$led get} {  
    $led mode out
    $led set 0
}
```

#### pulse:

Sets the state of a gpio pin to high for a specified amount of time(ms)  
Syntax: *gpioObject* pulse *time*  
```
set led [gpio -mode out 12]  
$led pulse 1000
```

#### onpulse:

When there is a pulse in the state of the gpio pin, run the callback function  
syntax: *gpioObject* onpulse {callbackFunction}  
```
# Basic Ultrasonic Code
set trig [gpio -mode out 5]
set echo [gpio -mode in 16]

$echo onpulse {
    set distance [expr {$duration / 58}]
    puts "Distance: $distance cm"
}

$trig pulse 10
```


### pwm:

Initialization: 
set *pwmObject* \[pwm \-channel *channelNo* \-resolution *resolution* \-frequency *frequency* *pinNo*\]  

#### PWM Command List:
- duty
- freq

#### duty:

Sets the duty cycle of the pwm signal using a double from 0 to 1  
Syntax: *pwmObject* duty *doubleValue*  
```
set buzzer [pwm -channel 3 -resolution 17 -frequency 587 27]  
$buzzer duty 0.5
```

#### freq:

Sets the frequency of the pwm signal using integers.   
syntax: *pwmObject* freq *intValue*  
```
set buzzer [pwm -channel 3 -resolution 17 -frequency 587 27]  
$buzzer duty 0.5  
after 1000
$buzzer freq 440  
```


### adc:

Initialization: 
set *adcObject* \[adc \-bitwidth *bitwidth* \-attenuation *addenuation* *pinNo*\]

#### ADC Command List:


### i2c:

Initialization: 
set *i2cObject* \[i2c -sda *sdaPin* -scl *sclPin* -freq *frequency*\]  

#### I2C Command List:
- read
- scan
- timeout
- write

#### read:

Reads and returns the value from the i2c slave address  
syntax: *i2cObject* read *Address* *bytesToRead*
```
set i2cDriver [i2c 21 22 100000]
set readVal [$i2cDriver read $address 1]
```

#### scan:

Scans and returns all i2c slave addresses connected to i2c bus
syntax: *i2cObject* scan -timeout *ms*
default: 10ms
```
set i2cDriver [i2c 21 22 100000]
puts "Addresses found:"
foreach address [$i2cDriver scan] {
    puts $address
}
```

#### write:

Writes the specified bits to the specified address on the i2c bus
Syntax: *i2cObject* write *address* *value*
```
$i2cDriver write $addr $val
```

#### stop:

Stops the I2C bus
Syntax: *i2cObject* stop
```
$i2cDriver stop
```

## spi:

Similar to i2c, there is a section in the examples titled 'spi_Examples' which contains premade configurations for spi devices  
Configures the serial peripheral interface  
Base setup syntax: \[spi -mosi *mosiPin* -miso *misoPin* -clk *clkPin* -host *hostType*\]  
For miso and mosi, if there is no pin, put '-1'  
```
set bus [spi -mosi 23 -miso -1 -clk 18]
```

### Define:

cs: chip select  
mode: SPI Mode  

### Defaults:

freq: 1000000  
mode: 0  

### add

Add setup syntax: \[*spiBaseObject* add -cs *csPin* -mode *modeNo* -freq *freqInHz*\]  
```
set dev [$bus add -cs 5 -mode 0 -freq 4000000]
```

#### send

transmits data over spi  
syntax: *spiAddObject* send *sentData* -timeout *ms*  
```
$dev send $data
```

#### recv

recieves N number of bytes over spi  
syntax: *spiAddObject* recv *nBytes* -timeout *ms*  
```
$dev recieve 5 -timeout 10
```

#### xfer

Transmits data and receives the result from that data  
syntax: *spiAddObject* xfer *sentData* -timeout *ms*  
```
$dev xfer $data -timeout 10
```

#### acquire

acquires the device from the bus  
syntax: *spiAddObject* acquire
```
$dev acquire
```

#### release

releases the device from the bus  
syntax: *spiAddObject* release  
```
$dev release
```

#### remove

removes the device from the bus  
syntax: *spiAddObject* remove  
```
$dev remove
```

### destroy

Frees the bus and all devices atteched to it  
syntax: *spiBaseObject* destroy  
```
$bus destroy
```

## adc:

Converts inputs from analog to digital.  
Setup syntax: \[adc -bitwidth *bitwidth* -attenuation *attenuation* \]  

### Defaults:

bitwidth: 12  
attenuation: 0  

### read

Reads the raw value from the ADC channel
Syntax: *adcObject* read
```
$adcObj read
```

## wifi:  

By default, the device with Lilota creates an access point that you can connect to for over the air.  
However, the device can be connected to a local wifi allowing for over the air access on the local wifi.  
When the device is connected, you can connect to the device using the IP address given  

### connect:  

connect to wireless network  
Syntax: wifi connect  

### disconnect: 

disconnect from a wireless network
Syntax: wifi disconnect

### init:

Configures wifi with parameters
Syntax: wifi init -mode *"sta|ap"* -channel *channel* -max_connections *max* -auth_mode *"wpa2_psk|wpa2_enterprise"* -identity *WPA2_Enterprise_Identity* -Username *WPA2_Enterprise_Username* *ssid* *password* {event {script} event2 {script2} ...}

#### defaults:
mode: sta  
channel: 1  
max: 4  
auth_mode: wpa2_psk  

#### Examples:
```
#Ex1: for sta mode
wifi init -mode sta $ssid $pass {
	sta_start {
	    log "Starting connection"
	    wifi connect
	}
	sta_connected {
	    log "Connected to wifi access point"
	}
	sta_disconnected {
	    log "Disconnected from wifi access point"
	    wifi connect
	}
	ip_ip4 {
	    log "Wifi IPv4 address: $ip"
	}
	ip_ip6 {
	    log "Wifi IPv6 address: $ipv6"
	}
	ip_lost {
	    log "Lost IP address from wifi access point"
	}
}
#Ex 2 for AP mode
wifi init -mode ap $HOSTNAME $pass {
        ap_start { }
        ap_staconnected {
            log "Client connected to AP with MAC address $mac and AID $aid"
        }
        ap_stadisconnected {
            log "Client disconnected from AP with MAC address $mac and AID $aid"
        }
        ip_staipassigned {
            log "Client assigned IP address $ip with MAC address $mac"
        }
    }

```

### scan

scans for wifi networks in range and returns the availble ones with their information
Syntax: wifi scan

### (NCI) status
returns the status of the wifi connection
Syntax: wifi status

## mqtt:

In order to monitor and send commands to the Lilota Device, MQTT can be used.  
You should be prompted to set up MQTT after Lilota was first flashed onto your microcontroller.  
If you didn't set it up then, go to Settings->Wireless->MQTT and you will be prompted with the window to set up MQTT.  

<img alt="MQTT UI Image" src="imgsrc/MQTT_UI_Mockup.png" width="300">

The MQTT Object Name is the name of the object variable that you will call the MQTT object with.  

### Example: If you put "mymqtt" as your MQTT Object Name  
```
$mymqtt status; #This will provide you with the status of the connection
```

### connect:  

Connects to the mqtt broker using the username and password in the MQTT object used  
Syntax: *mqttObject* connect

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
$mymqtt connect
```

### disconnect:  

Disconnects from the mqtt broker in the MQTT object used  
Syntax: *mqttObject* disconnect  

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
$mymqtt disconnect
```

### subscribe:

Subscribes to given MQTT topic with the specified quality of service from 0 to 2. This will allow for the device to get commands from the MQTT broker.  
The topic path is stored in the topicName variable and the commands from the MQTT are stored in the valueName variable.  
Syntax: *mqttObject* subscribe -qos *quality* *topicPath* {*topicName* *valueName*} {script}

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
$mymqtt subscribe -qos 0 mferdman/feeds/lilota-led {topicVar valueVar}
    global led
    if { $valueVar eq "ON"} {
        $led on
        log "LED turned ON"
    } else {
        $led off
        log "LED turned OFF"
    }
}
```

### (NCI) subscribedHandles:

Returns the currently subscribed topics of the MQTT object and the handles associated with them as a dictionary/map/associated array  
Syntax: *mqttObject* subscribedHandles  

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
#Ex1: 
set currentHandles [$mymqtt subscribedHandles]; #creates a new map called currentHandles that can accessed later

#Ex2:
$mymqtt subscribedHandles; #prints out the current subscribed topics and the handles associated with them. 
```

### unsubscribe:

Unsubscribes from the given mqtt handle  
Syntax: *mqttObject* unsubscribe *handle*
#### Example: If you put "mymqtt" as your MQTT Object Name  
```
$mymqtt unsubscribe 1
```

### publish:

Sends a message to the given topic of the mqtt object with the option for throw and retain flags  
throw: throws an error if the message didn't publish  
retain: stores the message inside of the topic which can then be sent out when a device subscribes to the topic  
Syntax: *mqttObject* publish -qos *quality* *-throw* *-retain* *topicPath* *message*  

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
#Ex1: with no flags
$mymqtt publish -qos 0 mferdman/feeds/lilota "Testing"

#Ex2: with only throw flag
$mymqtt publish -qos 0 -throw mferdman/feeds/lilota "Testing"

#Ex3: with both throw and retain flags
set status [$mymqtt status]
$mymqtt publish -qos 0 -throw -retain mferdman/feeds/lilota $status
```

### status:

Returns the status of the connection to the MQTT broker and (NCI) the address of the broker
Syntax: *mqttObject* status

#### Example: If you put "mymqtt" as your MQTT Object Name  
```
#Ex1:
$mymqtt status

$Ex2:
set status [$mymqtt status]
```
