# BLE Protocol

## Service and Characteristic Definition

|                  | Long Name             | Short Name | UUID Type | UUID                                 | Value Length   | Length Characteristic | Characteristic Properties | Characteristic  GATT Events |
|------------------|-----------------------|------------|-----------|--------------------------------------|----------------|-----------------------|---------------------------|-----------------------------|
| Service 1        | Transfer_Service      | TS         | 128 bits  | 906404A1-F555-48F5-90AA-EA4A691B82DB |                |                       |                           |                             |
| Characteristic 1 | Status                | STATUS     | 128 bits  | 906404A2-F555-48F5-90AA-EA4A691B82DB | (<=20)         | Constant              | Notify                    | Attribute write             |
| Characteristic 2 | Data_Communication    | COM        | 128 bits  | 906404A3-F555-48F5-90AA-EA4A691B82DB | 3              | Variable              | Write w/o resp            | Attribute write             |
| Characteristic 3 | Raw_Data              | DATA       | 128 bits  | 906404A4-F555-48F5-90AA-EA4A691B82DB | MTU-3 (<=247>) | Variable              | Notify                    | Attribute write             |
|                  |                       |            |           |                                      |                |                       |                           |                             |
| Service 2        | Configuration_Service | CS         | 128 bits  | 920927B1-101E-442C-AA2D-3976829777BA |                |                       |                           |                             |
| Characteristic 1 | Current_Time          | TIME       | 128 bits  | 920927B2-101E-442C-AA2D-3976829777BA | 10 (4?)        | Constant              | Read, Write w/o resp      | Attribute write             |
| Characteristic 2 | Unique_Device_ID      | ID         | 128 bits  | 920927B3-101E-442C-AA2D-3976829777BA | 4              | Constant              | Read                      |                             |
| Characteristic 3 | API_Key               | KEY        | 128 bits  | 920927B4-101E-442C-AA2D-3976829777BA | 44             | Constant              | Read, Write w/o resp      | Attribute write             |
| Characteristic 4 | Reading_Interval      | RI         | 128 bits  | 920927B5-101E-442C-AA2D-3976829777BA | 10 (2?)        | Constant              | Read, Write w/o resp      | Attribute write             |

STATUS is for basic information like battery level, charging, wearing, HR, etc.

MTU (maximum transmission unit)

## Raw Data Transfer Protocol
```mermaid
stateDiagram-v2

    state "Client (Mobile App)" as Client {

        %% DEFINE STATES %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        start_session : connect\n MTU negotiation\n <font color=blue>enable</font> notification of <font color=green>DATA</font>
        receive_ready : chunk counter = 0, ok status = false, restart ok status timer\n <font color=blue>write</font> ready to <font color=green>COM</font>
        monitor : <font color=blue>monitor</font> for <font color=green>DATA</font>

        ok : restart ok status timer\n <font color=blue>write</font> OK to <font color=green>COM</font>

        error : <font color=blue>write</font> ERROR to <font color=green>COM</font>

        done_session : <font color=blue>write</font> OK to <font color=green>COM</font>

        receive_nonfinal_ok : ok status = true, chunk counter++

        state ok_timer <<choice>>
        state receive_final <<choice>>
        state receive_nonfinal <<choice>>
        state total_chunks <<choice>>

        %% START DIAGRAM %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        [*] --> reset_session
        reset_session --> start_session
        start_session --> receive_ready
        receive_ready --> monitor

        %% data timeout
        monitor --> [*] : data timeout

        %% received nonfinal chunk
        monitor --> receive_nonfinal : received index < 0xFFFF

        receive_nonfinal --> receive_nonfinal_ok : next in sequence
        receive_nonfinal_ok --> ok_timer

        ok_timer --> monitor

        ok_timer --> ok : ok status timer up
        ok --> monitor

        receive_nonfinal --> error : out of sequence

        %% receive final 0xFFFF chunk
        monitor --> receive_final : received index 0xFFFF

        receive_final --> done_session : total chunks == chunk counter
        done_session --> total_chunks
        total_chunks --> receive_ready : total chunks >= 0
        total_chunks --> [*] : total chunks == 0

        receive_final --> error : total chunks != chunk counter

        %% received out of sequence chunk
        error --> monitor : ok status = false
    }
```
*ok status timeout* = 1s, *data timeout* = 10s


## Transfer Characteristic Format

#### <font color=green>COM</font> characteristic
| Message Description                                                                                     | Byte 0         | Byte 1..2                                |
|---------------------------------------------------------------------------------------------------------|----------------|------------------------------------------|
|                                                                                                         | *message type* |                                          |
| Ready to receive data                                                                                   | 0x00           |                                          |
| OK, proceed                                                                                             | 0x01           | last successfully received *chunk index* |
| ERROR (chunk out of sequence), restart sending chunk immediately after last successfully received chunk | 0x02           | last successfully received *chunk index* |

*message type*: unsigned 8-bit integer

#### <font color=green>DATA</font> characteristic
| Message Description                              | Byte 0..1      | Byte 2..3            | Byte 4..(N+1)            |
|--------------------------------------------------|----------------|----------------------|--------------------------|
|                                                  | *chunk index*  |                      |                          |
| Data                                             | [0, 0xFFFE]    | Chunk data byte 0..1 | Chunk data byte 2..(N-1) |
| Last message, also indicates *total chunks* sent | 0xFFFF         | *total chunks*       |                          |

*chunk index*: unsigned 16-bit integer (little-endian), [0,0xFFFE] indicates a normal data chunk and 0xFFFF indicates a special ending chunk.

*total chunks*: unsigned 16-bit integer (little-endian) with a range of [0,0xFFFF], indicating total number of data chunks sent.

*N*: the length of the chunk. Note that this must be <= MTU (maximum transmission unit) - 3 (bytes of ATT overhead) - 2 (bytes of *chunk index*). According to the BLE specifications, the MTU default size is 23 bytes, corresponding to *N*=18.

# Data Sample Format
Each data sample consists of 167 bytes in total.

| Name       | Description                           | Units     | Datatype (BE) | Byte Offset | Example    |
| ---------- | ------------------------------------- | --------- | ------------- | ----------- | ---------- |
| timestamp  | Unix time                             | s         | S32           | 0           | 1699553827 |
| soc        | Battery state of charge               | %         | U8            | 4           | 87         |
| vcell      | ADC measurement of battery            | 20 mV     | U8            | 5           | 180        |
| crate      | Rate of (dis)charge                   | %/hour    | S8            | 6           | \-4        |
| chgstat    | Charger status                        |           | U8            | 7           | 0          |
| touch[0]   | Touch sensor 1 delta                  |           | S16           | 8           | 6890       |
| touch[1]   | Touch sensor 2 delta                  |           | S16           | 10          | \-890      |
| eda        | Electrodermal activity                | ADC count | U16           | 12          | 4000       |
| hr         | Heartrate                             | bpm       | U8            | 14          | 87         |
| confidence | Heartrate confidence level            | %         | U8            | 15          | 50         |
| scd        | Skin contact detection                |           | U8            | 16          | 3          |
|            | Acceleration (25 samples, 1s @ 25 Hz) |           |               |             |            |
| accelX[0]  |                                       | mg        | S16           | 17          | 283        |
| accelY[0]  |                                       | mg        | S16           | 19          | \-15       |
| accelZ[0]  |                                       | mg        | S16           | 21          | 971        |
| accelX[1]  |                                       | mg        | S16           | 23          | 271        |
| accelY[1]  |                                       | mg        | S16           | 25          | \-7        |
| accelZ[1]  |                                       | mg        | S16           | 27          | 982        |
|            | …                                     |           |               |             |            |
| accelX[24] |                                       | mg        | S16           | 161         | \-102      |
| accelY[24] |                                       | mg        | S16           | 163         | \-955      |
| accelZ[24] |                                       | mg        | S16           | 165         | \-218      |
