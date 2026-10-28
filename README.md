# JioTV for TizenBrew

A remote-friendly TizenBrew app module for Samsung TVs. It opens the official JioTV website at https://jiotv.com/ using a simple Tizen 4-compatible web launcher.

## Add to TizenBrew

In TizenBrew, open **Module Manager** → **Add GitHub** and enter:

`Soumya019/jiotv-tizenbrew`

Refresh the module list and launch **JioTV**. The launcher opens the site automatically after a short delay; press **OK** to open immediately or **Back** to cancel the automatic launch.

## Compatibility

This is a web launcher, not an Android APK conversion. It does not reproduce JioTV's Android code or bypass sign-in or DRM. JioTV website support, sign-in, and playback depend on Jio's current service and the TV's browser. Samsung lists Tizen 4.0's web engine as Chromium M56, so compatibility is not guaranteed.

The existing `main.js` is retained from the earlier site-mod experiment and is not used by this app module.
