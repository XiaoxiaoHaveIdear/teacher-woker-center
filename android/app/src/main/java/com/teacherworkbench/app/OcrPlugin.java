package com.teacherworkbench.app;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Rect;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions;

/**
 * 课表 OCR：ML Kit 中文文本识别（模型内置，完全离线）。
 * 输入 base64 图片，输出按行划分的文本及坐标框。
 */
@CapacitorPlugin(name = "TimetableOcr")
public class OcrPlugin extends Plugin {
    private TextRecognizer recognizer;

    @PluginMethod
    public void recognize(PluginCall call) {
        String base64 = call.getString("base64");
        if (base64 == null || base64.isEmpty()) {
            call.reject("missing base64 image");
            return;
        }
        if (recognizer == null) {
            recognizer = TextRecognition.getClient(new ChineseTextRecognizerOptions.Builder().build());
        }
        try {
            byte[] data = Base64.decode(base64, Base64.DEFAULT);
            Bitmap bitmap = BitmapFactory.decodeByteArray(data, 0, data.length);
            if (bitmap == null) {
                call.reject("图片解码失败");
                return;
            }
            InputImage image = InputImage.fromBitmap(bitmap, 0);
            recognizer.process(image)
                .addOnSuccessListener(text -> {
                    JSArray lines = new JSArray();
                    JSArray elements = new JSArray();
                    for (Text.TextBlock block : text.getTextBlocks()) {
                        for (Text.Line line : block.getLines()) {
                            Rect lb = line.getBoundingBox();
                            String lt = line.getText();
                            if (lb != null && lt != null && !lt.trim().isEmpty()) {
                                JSObject o = new JSObject();
                                o.put("text", lt);
                                o.put("x0", lb.left);
                                o.put("y0", lb.top);
                                o.put("x1", lb.right);
                                o.put("y1", lb.bottom);
                                lines.put(o);
                            }
                            // 行内按元素（词级）输出：横向相邻格子的文字被合并成一行时，仍能按元素边界拆开
                            for (Text.Element el : line.getElements()) {
                                Rect b = el.getBoundingBox();
                                String t = el.getText();
                                if (b == null || t == null || t.trim().isEmpty()) continue;
                                JSObject o = new JSObject();
                                o.put("text", t);
                                o.put("x0", b.left);
                                o.put("y0", b.top);
                                o.put("x1", b.right);
                                o.put("y1", b.bottom);
                                elements.put(o);
                            }
                        }
                    }
                    JSObject ret = new JSObject();
                    ret.put("lines", lines);
                    ret.put("elements", elements);
                    call.resolve(ret);
                })
                .addOnFailureListener(e -> call.reject("识别失败: " + e.getMessage()));
        } catch (Exception e) {
            call.reject("识别失败: " + e.getMessage());
        }
    }
}
