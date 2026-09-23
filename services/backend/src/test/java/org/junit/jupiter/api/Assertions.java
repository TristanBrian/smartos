package org.junit.jupiter.api;

public class Assertions {
    public static void assertEquals(Object expected, Object actual) {
        if (expected == null && actual == null) return;
        if (expected != null && expected.equals(actual)) return;
        throw new AssertionError("Expected: " + expected + ", Actual: " + actual);
    }

    public static void assertEquals(long expected, long actual) {
        if (expected != actual) {
            throw new AssertionError("Expected: " + expected + ", Actual: " + actual);
        }
    }

    public static void assertNull(Object object, String message) {
        if (object != null) {
            throw new AssertionError(message + " (Expected null but got: " + object + ")");
        }
    }

    public static void assertTrue(boolean condition) {
        if (!condition) {
            throw new AssertionError("Expected condition to be true");
        }
    }

    public static <T extends Throwable> T assertThrows(Class<T> expectedType, Runnable executable) {
        try {
            executable.run();
        } catch (Throwable t) {
            if (expectedType.isInstance(t)) {
                return expectedType.cast(t);
            }
            throw new AssertionError("Expected exception " + expectedType.getName() + " but caught " + t.getClass().getName());
        }
        throw new AssertionError("Expected exception " + expectedType.getName() + " but no exception was thrown");
    }
}
