package com.soon.arrival;

import android.widget.Toast;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "ToastPlugin")
public class ToastPlugin extends Plugin {

    @PluginMethod()
    public void show(PluginCall call) {
        String text = call.getString("text", "");
        String duration = call.getString("duration", "short");
        
        int toastDuration = duration.equals("long") ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT;
        
        getActivity().runOnUiThread(() -> {
            Toast.makeText(getContext(), text, toastDuration).show();
        });
        
        call.resolve();
    }
}
