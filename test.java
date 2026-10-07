import java.lang.reflect.Method;
import java.lang.reflect.Constructor;
import java.io.File;
import java.net.URL;
import java.net.URLClassLoader;
public class Test {
    public static void main(String[] args) throws Exception {
        File file = new File("d:/ArrivingSoon_again/android/app/libs/iap_plugin_v17.03.00_20201007.jar");
        URL url = file.toURI().toURL();
        URLClassLoader classLoader = new URLClassLoader(new URL[]{url});
        Class<?> clazz = classLoader.loadClass("com.onestore.iap.api.PurchaseData");
        for (Constructor<?> c : clazz.getConstructors()) {
            System.out.println(c);
        }
        for (Method m : clazz.getMethods()) {
            System.out.println(m.getReturnType().getSimpleName() + " " + m.getName() + "()");
        }
    }
}
