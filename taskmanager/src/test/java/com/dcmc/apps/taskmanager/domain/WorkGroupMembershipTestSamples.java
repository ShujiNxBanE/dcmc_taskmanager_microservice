package com.dcmc.apps.taskmanager.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;

public class WorkGroupMembershipTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    public static WorkGroupMembership getWorkGroupMembershipSample1() {
        return new WorkGroupMembership().id(1L);
    }

    public static WorkGroupMembership getWorkGroupMembershipSample2() {
        return new WorkGroupMembership().id(2L);
    }

    public static WorkGroupMembership getWorkGroupMembershipRandomSampleGenerator() {
        return new WorkGroupMembership().id(longCount.incrementAndGet());
    }
}
