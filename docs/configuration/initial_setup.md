---
layout: default
title: Initial Setup
parent: Configuration
nav_order: 1
permalink: /configuration/initial_setup
---

# Initial Setup
{: .no_toc }

## Table of contents
{: .no_toc .text-delta }

1. TOC
{:toc}

---

Fluidd requires some basic configuration to be applied in order to function
correctly. Fluidd should warn you if these are not found in your configuration
upon startup.

## Printer Configuration

### [virtual_sdcard]

Fluidd requires your printer be setup with `virtual_sdcard`. This allows
file uploads to work correctly. If you get a geodes path not found error in
Fluidd this is generally the first place to look.

```yaml
[virtual_sdcard]
path: ~/gcode_files
```

### [display_status]

Required to properly support display updates in fluidd- with no other lines required.

```yaml
[display_status]
```

### [pause_resume]

Enables Pause / Resume functionality within klipper. This is a single block, with no other lines required.

```yaml
[pause_resume]
```

## Macros

These can be assumed sane defaults, but should be checked and modified to your own needs.

### PAUSE

```yaml
[gcode_macro PAUSE]
rename_existing: BASE_PAUSE
# change this if you need more or less extrusion
variable_extrude: 1.0
gcode:
  ##### read E from pause macro #####
  {% set E = printer["gcode_macro PAUSE"].extrude|float %}
  ##### set park positon for x and y #####
  # default is your max posion from your printer.cfg
  {% set x_park = printer.toolhead.axis_maximum.x|float - 5.0 %}
  {% set y_park = printer.toolhead.axis_maximum.y|float - 5.0 %}
  ##### calculate save lift position #####
  {% set max_z = printer.toolhead.axis_maximum.z|float %}
  {% set act_z = printer.toolhead.position.z|float %}
  {% if act_z < (max_z - 2.0) %}
      {% set z_safe = 2.0 %}
  {% else %}
      {% set z_safe = max_z - act_z %}
  {% endif %}
  ##### end of definitions #####
  SAVE_GCODE_STATE NAME=PAUSE_state
  BASE_PAUSE
  G91
  G1 E-{E} F2100
  G1 Z{z_safe} F900
  G90
  G1 X{x_park} Y{y_park} F6000
```

### RESUME

```yaml
[gcode_macro RESUME]
rename_existing: BASE_RESUME
gcode:
  ##### read E from pause macro #####
  {% set E = printer["gcode_macro PAUSE"].extrude|float %}
  ##### end of definitions #####
  G91
  G1 E{E} F2100
  RESTORE_GCODE_STATE NAME=PAUSE_state
  BASE_RESUME
```

### CANCEL_PRINT

```yaml
[gcode_macro CANCEL_PRINT]
rename_existing: BASE_CANCEL_PRINT
gcode:
  TURN_OFF_HEATERS
  CLEAR_PAUSE
  SDCARD_RESET_FILE
  BASE_CANCEL_PRINT
```
