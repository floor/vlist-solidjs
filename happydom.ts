// Test preload: register happy-dom globals before any test module (incl.
// solid-js/web, which reads `document` on import) is evaluated.
import { GlobalRegistrator } from "@happy-dom/global-registrator";
GlobalRegistrator.register();
